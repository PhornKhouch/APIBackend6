import { teachersApi } from '../api/teachersApi.js';
import { icon } from '../components/icons.js';
import { renderStatus } from '../components/table.js';
import { toast } from '../components/toast.js';
import { confirmDelete } from '../components/confirmDialog.js';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const STATUS_OPTIONS = ['Active', 'Inactive'];

// Full CRUD screen for node-api's /api/v1/teacher endpoints
// (src/controller/teacherController.js) — list, create, edit, delete.
export async function renderTeachersPage(contentEl) {
  contentEl.innerHTML = `
    <p class="placeholder-desc">View and manage teaching staff assignments.</p>
    <div class="card">
      <div class="card-header">
        <div><h3>Teachers</h3></div>
        <button class="btn btn-primary" id="add-teacher-btn" type="button">${icon('add')} Add Teacher</button>
      </div>
      <div id="teachers-table-target"></div>
    </div>

    <div class="modal-overlay" id="teacher-modal-overlay" hidden>
      <div class="modal">
        <div class="modal-header">
          <h3 id="teacher-modal-title">Add Teacher</h3>
          <button class="modal-close" id="teacher-modal-close" type="button">${icon('close')}</button>
        </div>
        <div class="modal-error" id="teacher-modal-error" hidden></div>
        <form id="teacher-form" novalidate>
          <div class="form-grid">
            <div class="form-group">
              <label>Username</label>
              <input type="text" name="username" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" name="email" required>
            </div>
            <div class="form-group" id="teacher-password-group">
              <label>Password</label>
              <input type="password" name="password">
            </div>
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
              <label>Specialization</label>
              <input type="text" name="specialization">
            </div>
            <div class="form-group">
              <label>Hire Date</label>
              <input type="date" name="hire_date">
            </div>
            <div class="form-group">
              <label>Status</label>
              <select name="status">
                ${STATUS_OPTIONS.map((s) => `<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>
            <div class="form-group full">
              <label>Bio</label>
              <textarea name="bio"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="teacher-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="teacher-save-btn">Save Teacher</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const tableEl = contentEl.querySelector('#teachers-table-target');
  const overlayEl = contentEl.querySelector('#teacher-modal-overlay');
  const formEl = contentEl.querySelector('#teacher-form');
  const titleEl = contentEl.querySelector('#teacher-modal-title');
  const errorEl = contentEl.querySelector('#teacher-modal-error');
  const passwordGroupEl = contentEl.querySelector('#teacher-password-group');
  const saveBtnEl = contentEl.querySelector('#teacher-save-btn');

  let teachersCache = [];
  let editingId = null;

  function openModal(teacher) {
    editingId = teacher ? teacher.teacher_id : null;
    errorEl.hidden = true;
    formEl.reset();

    const isEdit = Boolean(teacher);
    titleEl.textContent = isEdit ? 'Edit Teacher' : 'Add Teacher';
    passwordGroupEl.hidden = isEdit;
    formEl.elements.password.required = !isEdit;

    if (isEdit) {
      formEl.elements.username.value = teacher.User?.username || '';
      formEl.elements.email.value = teacher.User?.email || '';
      formEl.elements.first_name.value = teacher.first_name || '';
      formEl.elements.last_name.value = teacher.last_name || '';
      formEl.elements.gender.value = teacher.gender || '';
      formEl.elements.dob.value = teacher.dob ? String(teacher.dob).slice(0, 10) : '';
      formEl.elements.contact_number.value = teacher.contact_number || '';
      formEl.elements.specialization.value = teacher.specialization || '';
      formEl.elements.hire_date.value = teacher.hire_date ? String(teacher.hire_date).slice(0, 10) : '';
      formEl.elements.status.value = teacher.status || 'Active';
      formEl.elements.bio.value = teacher.bio || '';
    } else {
      formEl.elements.status.value = 'Active';
    }

    overlayEl.hidden = false;
  }

  function closeModal() {
    overlayEl.hidden = true;
    editingId = null;
  }

  contentEl.querySelector('#add-teacher-btn').addEventListener('click', () => openModal(null));
  contentEl.querySelector('#teacher-modal-close').addEventListener('click', closeModal);
  contentEl.querySelector('#teacher-cancel-btn').addEventListener('click', closeModal);
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
        await teachersApi.update(editingId, payload);
        toast.success('Teacher updated successfully');
      } else {
        await teachersApi.create(payload);
        toast.success('Teacher created successfully');
      }
      closeModal();
      await loadTeachers();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    } finally {
      saveBtnEl.disabled = false;
    }
  });

  async function handleDelete(teacher) {
    const name = `${teacher.first_name} ${teacher.last_name}`;
    const confirmed = await confirmDelete({
      title: `Delete teacher "${name}"?`,
      text: 'This also removes their login account and cannot be undone.',
    });
    if (!confirmed) return;
    try {
      await teachersApi.remove(teacher.teacher_id);
      toast.success('Teacher deleted successfully');
      await loadTeachers();
    } catch (err) {
      toast.error(`Failed to delete teacher: ${err.message}`);
    }
  }

  function renderTeachersTable(teachers) {
    if (!teachers.length) {
      tableEl.innerHTML = '<div class="state-msg">No teachers yet.</div>';
      return;
    }

    const rows = teachers.map((t) => `
      <tr>
        <td>${t.first_name} ${t.last_name}</td>
        <td>${t.User?.email || '—'}</td>
        <td>${t.specialization || '—'}</td>
        <td>${t.contact_number || '—'}</td>
        <td>${renderStatus(t.status)}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-icon" data-action="edit" data-id="${t.teacher_id}" type="button" title="Edit">${icon('edit')}</button>
            <button class="btn btn-icon btn-danger" data-action="delete" data-id="${t.teacher_id}" type="button" title="Delete">${icon('trash')}</button>
          </div>
        </td>
      </tr>
    `).join('');

    tableEl.innerHTML = `
      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Specialization</th><th>Contact</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    tableEl.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const teacher = teachersCache.find((t) => String(t.teacher_id) === btn.dataset.id);
        if (teacher) openModal(teacher);
      });
    });
    tableEl.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const teacher = teachersCache.find((t) => String(t.teacher_id) === btn.dataset.id);
        if (teacher) handleDelete(teacher);
      });
    });
  }

  async function loadTeachers() {
    tableEl.innerHTML = '<div class="state-msg">Loading teachers…</div>';
    try {
      teachersCache = await teachersApi.list();
      renderTeachersTable(teachersCache);
    } catch (err) {
      tableEl.innerHTML = `<div class="state-msg error">Failed to load teachers: ${err.message}</div>`;
    }
  }

  await loadTeachers();
}
