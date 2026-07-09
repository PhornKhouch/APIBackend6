import { subjectsApi } from '../api/subjectsApi.js';
import { icon } from '../components/icons.js';
import { toast } from '../components/toast.js';
import { confirmDelete } from '../components/confirmDialog.js';

// Full CRUD screen for node-api's /api/v1/subject endpoints
// (src/controller/subjectController.js) — list, create, edit, delete.
export async function renderSubjectsPage(contentEl) {
  contentEl.innerHTML = `
    <p class="placeholder-desc">Maintain the subject catalog and curriculum mapping.</p>
    <div class="card">
      <div class="card-header">
        <div><h3>Subjects</h3></div>
        <button class="btn btn-primary" id="add-subject-btn" type="button">${icon('add')} Add Subject</button>
      </div>
      <div id="subjects-table-target"></div>
    </div>

    <div class="modal-overlay" id="subject-modal-overlay" hidden>
      <div class="modal">
        <div class="modal-header">
          <h3 id="subject-modal-title">Add Subject</h3>
          <button class="modal-close" id="subject-modal-close" type="button">${icon('close')}</button>
        </div>
        <div class="modal-error" id="subject-modal-error" hidden></div>
        <form id="subject-form" novalidate>
          <div class="form-grid">
            <div class="form-group">
              <label>Subject Code</label>
              <input type="text" name="subject_code" required>
            </div>
            <div class="form-group">
              <label>Subject Name</label>
              <input type="text" name="subject_name" required>
            </div>
            <div class="form-group">
              <label>Prerequisite</label>
              <select name="prerequisite_subject_id" id="subject-prerequisite">
                <option value="">— None —</option>
              </select>
            </div>
            <div class="form-group full">
              <label>Description</label>
              <textarea name="description"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="subject-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="subject-save-btn">Save Subject</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const tableEl = contentEl.querySelector('#subjects-table-target');
  const overlayEl = contentEl.querySelector('#subject-modal-overlay');
  const formEl = contentEl.querySelector('#subject-form');
  const titleEl = contentEl.querySelector('#subject-modal-title');
  const errorEl = contentEl.querySelector('#subject-modal-error');
  const prereqEl = contentEl.querySelector('#subject-prerequisite');
  const saveBtnEl = contentEl.querySelector('#subject-save-btn');

  let subjectsCache = [];
  let editingId = null;

  function renderPrerequisiteOptions(currentId) {
    const options = subjectsCache
      .filter((s) => s.subject_id !== currentId)
      .map((s) => `<option value="${s.subject_id}">${s.subject_code} — ${s.subject_name}</option>`)
      .join('');
    prereqEl.innerHTML = `<option value="">— None —</option>${options}`;
  }

  function openModal(subject) {
    editingId = subject ? subject.subject_id : null;
    errorEl.hidden = true;
    formEl.reset();

    const isEdit = Boolean(subject);
    titleEl.textContent = isEdit ? 'Edit Subject' : 'Add Subject';
    renderPrerequisiteOptions(isEdit ? subject.subject_id : null);

    if (isEdit) {
      formEl.elements.subject_code.value = subject.subject_code || '';
      formEl.elements.subject_name.value = subject.subject_name || '';
      formEl.elements.description.value = subject.description || '';
      formEl.elements.prerequisite_subject_id.value = subject.prerequisite_subject_id || '';
    }

    overlayEl.hidden = false;
  }

  function closeModal() {
    overlayEl.hidden = true;
    editingId = null;
  }

  contentEl.querySelector('#add-subject-btn').addEventListener('click', () => openModal(null));
  contentEl.querySelector('#subject-modal-close').addEventListener('click', closeModal);
  contentEl.querySelector('#subject-cancel-btn').addEventListener('click', closeModal);
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
        await subjectsApi.update(editingId, payload);
        toast.success('Subject updated successfully');
      } else {
        await subjectsApi.create(payload);
        toast.success('Subject created successfully');
      }
      closeModal();
      await loadSubjects();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    } finally {
      saveBtnEl.disabled = false;
    }
  });

  async function handleDelete(subject) {
    const confirmed = await confirmDelete({
      title: `Delete subject "${subject.subject_name}"?`,
      text: 'This action cannot be undone.',
    });
    if (!confirmed) return;
    try {
      await subjectsApi.remove(subject.subject_id);
      toast.success('Subject deleted successfully');
      await loadSubjects();
    } catch (err) {
      toast.error(`Failed to delete subject: ${err.message}`);
    }
  }

  function renderSubjectsTable(subjects) {
    if (!subjects.length) {
      tableEl.innerHTML = '<div class="state-msg">No subjects yet.</div>';
      return;
    }

    const rows = subjects.map((s) => `
      <tr>
        <td>${s.subject_code}</td>
        <td>${s.subject_name}</td>
        <td>${s.Prerequisite ? `${s.Prerequisite.subject_code} — ${s.Prerequisite.subject_name}` : '—'}</td>
        <td>${s.description || '—'}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-icon" data-action="edit" data-id="${s.subject_id}" type="button" title="Edit">${icon('edit')}</button>
            <button class="btn btn-icon btn-danger" data-action="delete" data-id="${s.subject_id}" type="button" title="Delete">${icon('trash')}</button>
          </div>
        </td>
      </tr>
    `).join('');

    tableEl.innerHTML = `
      <table>
        <thead>
          <tr><th>Code</th><th>Name</th><th>Prerequisite</th><th>Description</th><th></th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    tableEl.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const subject = subjectsCache.find((s) => String(s.subject_id) === btn.dataset.id);
        if (subject) openModal(subject);
      });
    });
    tableEl.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const subject = subjectsCache.find((s) => String(s.subject_id) === btn.dataset.id);
        if (subject) handleDelete(subject);
      });
    });
  }

  async function loadSubjects() {
    tableEl.innerHTML = '<div class="state-msg">Loading subjects…</div>';
    try {
      subjectsCache = await subjectsApi.list();
      renderSubjectsTable(subjectsCache);
    } catch (err) {
      tableEl.innerHTML = `<div class="state-msg error">Failed to load subjects: ${err.message}</div>`;
    }
  }

  await loadSubjects();
}
