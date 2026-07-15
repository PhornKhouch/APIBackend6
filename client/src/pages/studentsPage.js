import { studentsApi } from '../api/studentsApi.js';
import { icon } from '../components/icons.js';
import { renderStatus } from '../components/table.js';
import { toast } from '../components/toast.js';
import { confirmDelete } from '../components/confirmDialog.js';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const STATUS_OPTIONS = ['Active', 'Inactive'];

// Full CRUD screen for node-api's /api/v1/student endpoints
// (src/controller/studentController.js) — list, create, edit, delete.
export async function renderStudentsPage(contentEl) {
  contentEl.innerHTML = `
    <p class="placeholder-desc">Manage student records, enrollment, and profiles.</p>
    <div class="card">
      <div class="card-header">
        <div><h3>Students</h3></div>
        <button class="btn btn-primary" id="add-student-btn" type="button">${icon('add')} Add Student</button>
      </div>
      <div id="students-table-target"></div>
    </div>

    <div class="modal-overlay" id="student-modal-overlay" hidden>
      <div class="modal">
        <div class="modal-header">
          <h3 id="student-modal-title">Add Student</h3>
          <button class="modal-close" id="student-modal-close" type="button">${icon('close')}</button>
        </div>
        <div class="modal-error" id="student-modal-error" hidden></div>
        <form id="student-form" novalidate>
          <div class="form-grid">
            <div class="form-group">
              <label>First Name</label>
              <input type="text" name="first_name" required>
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input type="text" name="last_name" required>
            </div>
            <div class="form-group">
              <label>Gender</label>
              <select name="gender">
                <option value="">—</option>
                ${GENDER_OPTIONS.map((g) => `<option value="${g}">${g}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Date of Birth</label>
              <input type="date" name="dob">
            </div>
            <div class="form-group">
              <label>Contact Number</label>
              <input type="text" name="contact_number">
            </div>
            <div class="form-group">
              <label>Enrollment Date</label>
              <input type="date" name="enrollment_date" required>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select name="status">
                ${STATUS_OPTIONS.map((s) => `<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Photo URL</label>
              <input type="text" name="photo_url">
            </div>
            <div class="form-group full">
              <label>Address</label>
              <textarea name="address"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="student-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="student-save-btn">Save Student</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const tableEl = contentEl.querySelector('#students-table-target');
  const overlayEl = contentEl.querySelector('#student-modal-overlay');
  const formEl = contentEl.querySelector('#student-form');
  const titleEl = contentEl.querySelector('#student-modal-title');
  const errorEl = contentEl.querySelector('#student-modal-error');
  const saveBtnEl = contentEl.querySelector('#student-save-btn');

  let studentsCache = [];
  let editingId = null;

  function openModal(student) {
    editingId = student ? student.student_id : null;
    errorEl.hidden = true;
    formEl.reset();

    const isEdit = Boolean(student);
    titleEl.textContent = isEdit ? 'Edit Student' : 'Add Student';

    if (isEdit) {
      formEl.elements.first_name.value = student.first_name || '';
      formEl.elements.last_name.value = student.last_name || '';
      formEl.elements.gender.value = student.gender || '';
      formEl.elements.dob.value = student.dob ? String(student.dob).slice(0, 10) : '';
      formEl.elements.contact_number.value = student.contact_number || '';
      formEl.elements.enrollment_date.value = student.enrollment_date ? String(student.enrollment_date).slice(0, 10) : '';
      formEl.elements.status.value = student.status || 'Active';
      formEl.elements.photo_url.value = student.photo_url || '';
      formEl.elements.address.value = student.address || '';
    } else {
      formEl.elements.status.value = 'Active';
    }

    overlayEl.hidden = false;
  }

  function closeModal() {
    overlayEl.hidden = true;
    editingId = null;
  }

  contentEl.querySelector('#add-student-btn').addEventListener('click', () => openModal(null));
  contentEl.querySelector('#student-modal-close').addEventListener('click', closeModal);
  contentEl.querySelector('#student-cancel-btn').addEventListener('click', closeModal);
  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl) closeModal();
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
        await studentsApi.update(editingId, payload);
        toast.success('Student updated successfully');
      } else {
        await studentsApi.create(payload);
        toast.success('Student created successfully');
      }
      closeModal();
      await loadStudents();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    } finally {
      saveBtnEl.disabled = false;
    }
  });

  async function handleDelete(student) {
    const name = `${student.first_name} ${student.last_name}`;
    const confirmed = await confirmDelete({
      title: `Delete student "${name}"?`,
      text: 'This action cannot be undone.',
    });
    if (!confirmed) return;
    try {
      await studentsApi.remove(student.student_id);
      toast.success('Student deleted successfully');
      await loadStudents();
    } catch (err) {
      toast.error(`Failed to delete student: ${err.message}`);
    }
  }

  function renderStudentsTable(students) {
    if (!students.length) {
      tableEl.innerHTML = '<div class="state-msg">No students yet.</div>';
      return;
    }

    const rows = students.map((s) => `
      <tr>
        <td>${s.first_name} ${s.last_name}</td>
        <td>${s.gender || '—'}</td>
        <td>${s.contact_number || '—'}</td>
        <td>${s.enrollment_date ? String(s.enrollment_date).slice(0, 10) : '—'}</td>
        <td>${renderStatus(s.status)}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-icon" data-action="edit" data-id="${s.student_id}" type="button" title="Edit">${icon('edit')}</button>
            <button class="btn btn-icon btn-danger" data-action="delete" data-id="${s.student_id}" type="button" title="Delete">${icon('trash')}</button>
          </div>
        </td>
      </tr>
    `).join('');

    tableEl.innerHTML = `
      <table>
        <thead>
          <tr><th>Name</th><th>Gender</th><th>Contact</th><th>Enrolled</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    tableEl.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const student = studentsCache.find((s) => String(s.student_id) === btn.dataset.id);
        if (student) openModal(student);
      });
    });
    tableEl.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const student = studentsCache.find((s) => String(s.student_id) === btn.dataset.id);
        if (student) handleDelete(student);
      });
    });
  }

  async function loadStudents() {
    tableEl.innerHTML = '<div class="state-msg">Loading students…</div>';
    try {
      studentsCache = await studentsApi.list();
      renderStudentsTable(studentsCache);
    } catch (err) {
      tableEl.innerHTML = `<div class="state-msg error">Failed to load students: ${err.message}</div>`;
    }
  }

  await loadStudents();
}
