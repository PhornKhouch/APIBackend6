import { classesApi } from '../api/classesApi.js';
import { academicYearsApi } from '../api/academicYearsApi.js';
import { semestersApi } from '../api/semestersApi.js';
import { teachersApi } from '../api/teachersApi.js';
import { studentsApi } from '../api/studentsApi.js';
import { icon } from '../components/icons.js';
import { toast } from '../components/toast.js';
import { confirmDelete } from '../components/confirmDialog.js';

const teacherName = (t) => `${t.first_name || ''} ${t.last_name || ''}`.trim();
const studentName = (s) => (s ? `${s.first_name || ''} ${s.last_name || ''}`.trim() : '');

// Full CRUD screen for node-api's /api/v1/class endpoints
// (src/controller/classesController.js) — list, create, edit, delete.
// Academic year, semester and homeroom teacher dropdowns are populated from
// their own endpoints so the ids always match real rows.
export async function renderClassesPage(contentEl) {
  contentEl.innerHTML = `
    <p class="placeholder-desc">Organize classes, sections, and rosters.</p>
    <div class="card">
      <div class="card-header">
        <div><h3>Classes</h3></div>
        <button class="btn btn-primary" id="add-class-btn" type="button">${icon('add')} Add Class</button>
      </div>
      <div id="classes-table-target"></div>
    </div>

    <div class="modal-overlay" id="class-modal-overlay" hidden>
      <div class="modal">
        <div class="modal-header">
          <h3 id="class-modal-title">Add Class</h3>
          <button class="modal-close" id="class-modal-close" type="button">${icon('close')}</button>
        </div>
        <div class="modal-error" id="class-modal-error" hidden></div>
        <form id="class-form" novalidate>
          <div class="form-grid">
            <div class="form-group">
              <label>Class Name</label>
              <input type="text" name="class_name" placeholder="Grade 10 - Section A" required>
            </div>
            <div class="form-group">
              <label>Academic Year</label>
              <select name="academic_year_id" id="class-academic-year" required>
                <option value="">— Select —</option>
              </select>
            </div>
            <div class="form-group">
              <label>Semester</label>
              <select name="semester_id" id="class-semester" required>
                <option value="">— Select —</option>
              </select>
            </div>
            <div class="form-group">
              <label>Homeroom Teacher</label>
              <select name="homeroom_teacher_id" id="class-teacher">
                <option value="">— None —</option>
              </select>
            </div>
            <div class="form-group">
              <label>Room Number</label>
              <input type="text" name="room_number">
            </div>
            <div class="form-group">
              <label>Max Capacity</label>
              <input type="number" name="max_capacity" min="0">
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="class-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="class-save-btn">Save Class</button>
          </div>
        </form>
      </div>
    </div>

    <div class="modal-overlay" id="enroll-modal-overlay" hidden>
      <div class="modal">
        <div class="modal-header">
          <h3 id="enroll-modal-title">Assign Students</h3>
          <button class="modal-close" id="enroll-modal-close" type="button">${icon('close')}</button>
        </div>
        <div class="modal-error" id="enroll-modal-error" hidden></div>
        <p class="assign-context" id="enroll-context"></p>
        <input type="text" class="assign-search" id="enroll-search" placeholder="Search students…">
        <div class="assign-list" id="enroll-list"></div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="enroll-cancel-btn">Cancel</button>
          <button type="button" class="btn btn-primary" id="enroll-save-btn">Save Assignments</button>
        </div>
      </div>
    </div>
  `;

  const tableEl = contentEl.querySelector('#classes-table-target');
  const overlayEl = contentEl.querySelector('#class-modal-overlay');
  const formEl = contentEl.querySelector('#class-form');
  const titleEl = contentEl.querySelector('#class-modal-title');
  const errorEl = contentEl.querySelector('#class-modal-error');
  const yearEl = contentEl.querySelector('#class-academic-year');
  const semesterEl = contentEl.querySelector('#class-semester');
  const teacherEl = contentEl.querySelector('#class-teacher');
  const saveBtnEl = contentEl.querySelector('#class-save-btn');

  const enrollOverlayEl = contentEl.querySelector('#enroll-modal-overlay');
  const enrollContextEl = contentEl.querySelector('#enroll-context');
  const enrollErrorEl = contentEl.querySelector('#enroll-modal-error');
  const enrollSearchEl = contentEl.querySelector('#enroll-search');
  const enrollListEl = contentEl.querySelector('#enroll-list');
  const enrollSaveBtnEl = contentEl.querySelector('#enroll-save-btn');

  let classesCache = [];
  // Reference lists for the dropdowns / table labels, loaded once from their
  // own endpoints alongside the classes list.
  let academicYears = [];
  let semesters = [];
  let teachers = [];
  let students = [];
  let editingId = null;
  // Class the assign-students panel currently targets + its checked student_ids.
  let enrollingId = null;
  let enrollSelected = new Set();

  function renderYearOptions(selectedId) {
    const options = academicYears
      .map((y) => `<option value="${y.academic_year_id}">${y.year_name}</option>`)
      .join('');
    yearEl.innerHTML = `<option value="">— Select —</option>${options}`;
    if (selectedId != null) yearEl.value = String(selectedId);
  }

  function renderSemesterOptions(selectedId) {
    const options = semesters
      .map((s) => `<option value="${s.semester_id}">${s.semester_name}</option>`)
      .join('');
    semesterEl.innerHTML = `<option value="">— Select —</option>${options}`;
    if (selectedId != null) semesterEl.value = String(selectedId);
  }

  function renderTeacherOptions(selectedId) {
    const options = teachers
      .map((t) => `<option value="${t.teacher_id}">${teacherName(t)}</option>`)
      .join('');
    teacherEl.innerHTML = `<option value="">— None —</option>${options}`;
    if (selectedId != null) teacherEl.value = String(selectedId);
  }

  async function loadReferenceData() {
    const [years, sems, tchrs, studs] = await Promise.all([
      academicYearsApi.list().catch(() => []),
      semestersApi.list().catch(() => []),
      teachersApi.list().catch(() => []),
      studentsApi.list().catch(() => []),
    ]);
    academicYears = years || [];
    semesters = sems || [];
    teachers = tchrs || [];
    students = studs || [];
  }

  function lookupYear(id) {
    const match = academicYears.find((y) => String(y.academic_year_id) === String(id));
    return match ? match.year_name : '—';
  }

  function lookupSemester(id) {
    const match = semesters.find((s) => String(s.semester_id) === String(id));
    return match ? match.semester_name : '—';
  }

  function lookupTeacher(id) {
    const match = teachers.find((t) => String(t.teacher_id) === String(id));
    return match ? teacherName(match) : '—';
  }

  function openModal(classItem) {
    editingId = classItem ? classItem.class_id : null;
    errorEl.hidden = true;
    formEl.reset();

    const isEdit = Boolean(classItem);
    titleEl.textContent = isEdit ? 'Edit Class' : 'Add Class';

    renderYearOptions(isEdit ? classItem.academic_year_id : null);
    renderSemesterOptions(isEdit ? classItem.semester_id : null);
    renderTeacherOptions(isEdit ? classItem.homeroom_teacher_id : null);

    if (isEdit) {
      formEl.elements.class_name.value = classItem.class_name || '';
      formEl.elements.room_number.value = classItem.room_number || '';
      formEl.elements.max_capacity.value =
        classItem.max_capacity != null ? classItem.max_capacity : '';
    }

    overlayEl.hidden = false;
  }

  function closeModal() {
    overlayEl.hidden = true;
    editingId = null;
  }

  // ---- Assign-students (class enrollment) panel ----

  function renderEnrollList() {
    const query = enrollSearchEl.value.trim().toLowerCase();
    const matches = students.filter((s) => {
      if (!query) return true;
      return studentName(s).toLowerCase().includes(query);
    });

    if (!students.length) {
      enrollListEl.innerHTML = '<div class="state-msg">No students available.</div>';
      return;
    }
    if (!matches.length) {
      enrollListEl.innerHTML = '<div class="state-msg">No students match your search.</div>';
      return;
    }

    enrollListEl.innerHTML = matches
      .map((s) => {
        const id = s.student_id;
        const checked = enrollSelected.has(String(id)) ? 'checked' : '';
        return `
          <label class="assign-item">
            <input type="checkbox" data-student-id="${id}" ${checked}>
            <span>${studentName(s) || `Student #${id}`}</span>
          </label>`;
      })
      .join('');

    enrollListEl.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const id = cb.dataset.studentId;
        if (cb.checked) enrollSelected.add(id);
        else enrollSelected.delete(id);
      });
    });
  }

  async function openEnrollModal(classItem) {
    enrollingId = classItem.class_id;
    enrollSelected = new Set();
    enrollErrorEl.hidden = true;
    enrollSearchEl.value = '';
    enrollContextEl.textContent = classItem.class_name || `Class #${classItem.class_id}`;
    enrollListEl.innerHTML = '<div class="state-msg">Loading students…</div>';
    enrollOverlayEl.hidden = false;

    try {
      const enrollments = await classesApi.listStudents(classItem.class_id);
      (enrollments || []).forEach((e) => enrollSelected.add(String(e.student_id)));
    } catch (err) {
      enrollErrorEl.textContent = `Failed to load current enrollments: ${err.message}`;
      enrollErrorEl.hidden = false;
    }
    renderEnrollList();
  }

  function closeEnrollModal() {
    enrollOverlayEl.hidden = true;
    enrollingId = null;
  }

  contentEl.querySelector('#add-class-btn').addEventListener('click', () => openModal(null));
  contentEl.querySelector('#class-modal-close').addEventListener('click', closeModal);
  contentEl.querySelector('#class-cancel-btn').addEventListener('click', closeModal);
  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl) closeModal();
  });

  enrollSearchEl.addEventListener('input', renderEnrollList);
  contentEl.querySelector('#enroll-modal-close').addEventListener('click', closeEnrollModal);
  contentEl.querySelector('#enroll-cancel-btn').addEventListener('click', closeEnrollModal);
  enrollOverlayEl.addEventListener('click', (e) => {
    if (e.target === enrollOverlayEl) closeEnrollModal();
  });

  enrollSaveBtnEl.addEventListener('click', async () => {
    if (!enrollingId) return;
    enrollErrorEl.hidden = true;
    enrollSaveBtnEl.disabled = true;
    try {
      const ids = [...enrollSelected].map(Number);
      await classesApi.setStudents(enrollingId, ids);
      toast.success(`${ids.length} student${ids.length === 1 ? '' : 's'} assigned`);
      closeEnrollModal();
    } catch (err) {
      enrollErrorEl.textContent = err.message;
      enrollErrorEl.hidden = false;
    } finally {
      enrollSaveBtnEl.disabled = false;
    }
  });

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!formEl.reportValidity()) return;

    errorEl.hidden = true;
    const payload = Object.fromEntries(new FormData(formEl).entries());
    Object.keys(payload).forEach((key) => {
      if (payload[key] === '') delete payload[key];
    });

    saveBtnEl.disabled = true;
    try {
      if (editingId) {
        await classesApi.update(editingId, payload);
        toast.success('Class updated successfully');
      } else {
        await classesApi.create(payload);
        toast.success('Class created successfully');
      }
      closeModal();
      await loadClasses();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    } finally {
      saveBtnEl.disabled = false;
    }
  });

  async function handleDelete(classItem) {
    const confirmed = await confirmDelete({
      title: `Delete class "${classItem.class_name}"?`,
      text: 'This action cannot be undone.',
    });
    if (!confirmed) return;
    try {
      await classesApi.remove(classItem.class_id);
      toast.success('Class deleted successfully');
      await loadClasses();
    } catch (err) {
      toast.error(`Failed to delete class: ${err.message}`);
    }
  }

  function renderClassesTable(classes) {
    if (!classes.length) {
      tableEl.innerHTML = '<div class="state-msg">No classes yet.</div>';
      return;
    }

    // Prefer the nested association returned by the API, fall back to the
    // reference lists loaded from the other endpoints.
    const yearName = (c) => (c.AcademicYear ? c.AcademicYear.year_name : lookupYear(c.academic_year_id));
    const semesterName = (c) => (c.Semester ? c.Semester.semester_name : lookupSemester(c.semester_id));
    const homeroom = (c) => (c.HomeroomTeacher ? teacherName(c.HomeroomTeacher) : lookupTeacher(c.homeroom_teacher_id));

    const rows = classes.map((c) => `
      <tr>
        <td>${c.class_name}</td>
        <td>${yearName(c)}</td>
        <td>${semesterName(c)}</td>
        <td>${c.room_number || '—'}</td>
        <td>${c.max_capacity != null ? c.max_capacity : '—'}</td>
        <td>${homeroom(c)}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-icon" data-action="assign" data-id="${c.class_id}" type="button" title="Assign Students">${icon('personAdd')}</button>
            <button class="btn btn-icon" data-action="edit" data-id="${c.class_id}" type="button" title="Edit">${icon('edit')}</button>
            <button class="btn btn-icon btn-danger" data-action="delete" data-id="${c.class_id}" type="button" title="Delete">${icon('trash')}</button>
          </div>
        </td>
      </tr>
    `).join('');

    tableEl.innerHTML = `
      <table>
        <thead>
          <tr><th>Class</th><th>Academic Year</th><th>Semester</th><th>Room</th><th>Capacity</th><th>Homeroom Teacher</th><th></th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    tableEl.querySelectorAll('[data-action="assign"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const classItem = classesCache.find((c) => String(c.class_id) === btn.dataset.id);
        if (classItem) openEnrollModal(classItem);
      });
    });
    tableEl.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const classItem = classesCache.find((c) => String(c.class_id) === btn.dataset.id);
        if (classItem) openModal(classItem);
      });
    });
    tableEl.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const classItem = classesCache.find((c) => String(c.class_id) === btn.dataset.id);
        if (classItem) handleDelete(classItem);
      });
    });
  }

  async function loadClasses() {
    tableEl.innerHTML = '<div class="state-msg">Loading classes…</div>';
    try {
      classesCache = await classesApi.list();
      renderClassesTable(classesCache);
    } catch (err) {
      tableEl.innerHTML = `<div class="state-msg error">Failed to load classes: ${err.message}</div>`;
    }
  }

  await loadReferenceData();
  await loadClasses();
}
