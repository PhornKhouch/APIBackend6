import { semestersApi } from '../api/semestersApi.js';
import { icon } from '../components/icons.js';
import { toast } from '../components/toast.js';
import { confirmDelete } from '../components/confirmDialog.js';

const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');

// Academic years aren't exposed by their own endpoint yet, so the dropdown
// uses a fixed 2025–2030 list. `academic_year_id` must match the seeded rows
// in the academic_years table (assumed sequential from 1) — adjust the ids
// here if your seed differs.
const ACADEMIC_YEARS = [
  { academic_year_id: 1, year_name: '2025-2026' },
  { academic_year_id: 2, year_name: '2026-2027' },
  { academic_year_id: 3, year_name: '2027-2028' },
  { academic_year_id: 4, year_name: '2028-2029' },
  { academic_year_id: 5, year_name: '2029-2030' },
];

// Full CRUD screen for node-api's /api/v1/semester endpoints
// (src/controller/semesterController.js) — list, create, edit, delete.
export async function renderSemestersPage(contentEl) {
  contentEl.innerHTML = `
    <p class="placeholder-desc">Define academic terms and their date ranges.</p>
    <div class="card">
      <div class="card-header">
        <div><h3>Semesters</h3></div>
        <button class="btn btn-primary" id="add-semester-btn" type="button">${icon('add')} Add Semester</button>
      </div>
      <div id="semesters-table-target"></div>
    </div>

    <div class="modal-overlay" id="semester-modal-overlay" hidden>
      <div class="modal">
        <div class="modal-header">
          <h3 id="semester-modal-title">Add Semester</h3>
          <button class="modal-close" id="semester-modal-close" type="button">${icon('close')}</button>
        </div>
        <div class="modal-error" id="semester-modal-error" hidden></div>
        <form id="semester-form" novalidate>
          <div class="form-grid">
            <div class="form-group">
              <label>Academic Year</label>
              <select name="academic_year_id" id="semester-academic-year" required>
                <option value="">— Select —</option>
              </select>
            </div>
            <div class="form-group">
              <label>Semester Name</label>
              <input type="text" name="semester_name" required>
            </div>
            <div class="form-group">
              <label>Start Date</label>
              <input type="date" name="start_date" required>
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input type="date" name="end_date" required>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="semester-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="semester-save-btn">Save Semester</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const tableEl = contentEl.querySelector('#semesters-table-target');
  const overlayEl = contentEl.querySelector('#semester-modal-overlay');
  const formEl = contentEl.querySelector('#semester-form');
  const titleEl = contentEl.querySelector('#semester-modal-title');
  const errorEl = contentEl.querySelector('#semester-modal-error');
  const yearEl = contentEl.querySelector('#semester-academic-year');
  const saveBtnEl = contentEl.querySelector('#semester-save-btn');

  let semestersCache = [];
  let editingId = null;

  function renderAcademicYearOptions(selectedId) {
    const options = ACADEMIC_YEARS
      .map((y) => `<option value="${y.academic_year_id}">${y.year_name}</option>`)
      .join('');
    yearEl.innerHTML = `<option value="">— Select —</option>${options}`;
    if (selectedId != null) yearEl.value = String(selectedId);
  }

  function openModal(semester) {
    editingId = semester ? semester.semester_id : null;
    errorEl.hidden = true;
    formEl.reset();

    const isEdit = Boolean(semester);
    titleEl.textContent = isEdit ? 'Edit Semester' : 'Add Semester';
    renderAcademicYearOptions(isEdit ? semester.academic_year_id : null);

    if (isEdit) {
      formEl.elements.semester_name.value = semester.semester_name || '';
      formEl.elements.start_date.value = fmtDate(semester.start_date);
      formEl.elements.end_date.value = fmtDate(semester.end_date);
    }

    overlayEl.hidden = false;
  }

  function closeModal() {
    overlayEl.hidden = true;
    editingId = null;
  }

  contentEl.querySelector('#add-semester-btn').addEventListener('click', () => openModal(null));
  contentEl.querySelector('#semester-modal-close').addEventListener('click', closeModal);
  contentEl.querySelector('#semester-cancel-btn').addEventListener('click', closeModal);
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
        await semestersApi.update(editingId, payload);
        toast.success('Semester updated successfully');
      } else {
        await semestersApi.create(payload);
        toast.success('Semester created successfully');
      }
      closeModal();
      await loadSemesters();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    } finally {
      saveBtnEl.disabled = false;
    }
  });

  async function handleDelete(semester) {
    const confirmed = await confirmDelete({
      title: `Delete semester "${semester.semester_name}"?`,
      text: 'This action cannot be undone.',
    });
    if (!confirmed) return;
    try {
      await semestersApi.remove(semester.semester_id);
      toast.success('Semester deleted successfully');
      await loadSemesters();
    } catch (err) {
      toast.error(`Failed to delete semester: ${err.message}`);
    }
  }

  function renderSemestersTable(semesters) {
    if (!semesters.length) {
      tableEl.innerHTML = '<div class="state-msg">No semesters yet.</div>';
      return;
    }

    const rows = semesters.map((s) => `
      <tr>
        <td>${s.semester_name}</td>
        <td>${s.AcademicYear ? s.AcademicYear.year_name : '—'}</td>
        <td>${fmtDate(s.start_date) || '—'}</td>
        <td>${fmtDate(s.end_date) || '—'}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-icon" data-action="edit" data-id="${s.semester_id}" type="button" title="Edit">${icon('edit')}</button>
            <button class="btn btn-icon btn-danger" data-action="delete" data-id="${s.semester_id}" type="button" title="Delete">${icon('trash')}</button>
          </div>
        </td>
      </tr>
    `).join('');

    tableEl.innerHTML = `
      <table>
        <thead>
          <tr><th>Semester</th><th>Academic Year</th><th>Start Date</th><th>End Date</th><th></th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    tableEl.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const semester = semestersCache.find((s) => String(s.semester_id) === btn.dataset.id);
        if (semester) openModal(semester);
      });
    });
    tableEl.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const semester = semestersCache.find((s) => String(s.semester_id) === btn.dataset.id);
        if (semester) handleDelete(semester);
      });
    });
  }

  async function loadSemesters() {
    tableEl.innerHTML = '<div class="state-msg">Loading semesters…</div>';
    try {
      semestersCache = await semestersApi.list();
      renderSemestersTable(semestersCache);
    } catch (err) {
      tableEl.innerHTML = `<div class="state-msg error">Failed to load semesters: ${err.message}</div>`;
    }
  }

  await loadSemesters();
}
