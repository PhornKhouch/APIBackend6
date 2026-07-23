import { academicYearsApi } from '../api/academicYearsApi.js';
import { timeSlotsApi } from '../api/timeSlotsApi.js';
import { semestersApi } from '../api/semestersApi.js';
import { icon } from '../components/icons.js';
import { renderStatus } from '../components/table.js';
import { toast } from '../components/toast.js';
import { confirmDelete } from '../components/confirmDialog.js';

const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');
// Display times as hh:mm (trim any seconds off the stored HH:MM:SS).
const fmtTime = (t) => (t ? String(t).slice(0, 5) : '');
const YEAR_STATUS_OPTIONS = ['Active', 'Closed'];
const DAY_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Setup screen with three tabs — Academic Years (/api/v1/academic-year),
// Time Slots (/api/v1/time-slot) and Semesters (/api/v1/semester). Each tab is
// a self-contained CRUD panel.
export async function renderSetupPage(contentEl) {
  contentEl.innerHTML = `
    <p class="placeholder-desc">Configure academic years, class time slots and semesters.</p>
    <div class="tabs" id="setup-tabs">
      <button class="tab active" data-tab="academic-years" type="button">Academic Years</button>
      <button class="tab" data-tab="time-slots" type="button">Time Slots</button>
      <button class="tab" data-tab="semesters" type="button">Semesters</button>
    </div>
    <div class="tab-panel" data-panel="academic-years"></div>
    <div class="tab-panel" data-panel="time-slots" hidden></div>
    <div class="tab-panel" data-panel="semesters" hidden></div>
  `;

  const tabsEl = contentEl.querySelector('#setup-tabs');
  const panels = {
    'academic-years': contentEl.querySelector('[data-panel="academic-years"]'),
    'time-slots': contentEl.querySelector('[data-panel="time-slots"]'),
    'semesters': contentEl.querySelector('[data-panel="semesters"]'),
  };

  tabsEl.querySelectorAll('.tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      tabsEl.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      Object.entries(panels).forEach(([key, el]) => {
        el.hidden = key !== btn.dataset.tab;
      });
    });
  });

  await Promise.all([
    setupAcademicYears(panels['academic-years']),
    setupTimeSlots(panels['time-slots']),
    setupSemesters(panels['semesters']),
  ]);
}

// ---------- ACADEMIC YEARS ----------
async function setupAcademicYears(panelEl) {
  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div><h3>Academic Years</h3></div>
        <button class="btn btn-primary" id="add-ay-btn" type="button">${icon('add')} Add Academic Year</button>
      </div>
      <div id="ay-table-target"></div>
    </div>

    <div class="modal-overlay" id="ay-modal-overlay" hidden>
      <div class="modal">
        <div class="modal-header">
          <h3 id="ay-modal-title">Add Academic Year</h3>
          <button class="modal-close" id="ay-modal-close" type="button">${icon('close')}</button>
        </div>
        <div class="modal-error" id="ay-modal-error" hidden></div>
        <form id="ay-form" novalidate>
          <div class="form-grid">
            <div class="form-group">
              <label>Year Name</label>
              <input type="text" name="year_name" placeholder="2025-2026" required>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select name="status">
                ${YEAR_STATUS_OPTIONS.map((s) => `<option value="${s}">${s}</option>`).join('')}
              </select>
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
            <button type="button" class="btn btn-secondary" id="ay-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="ay-save-btn">Save Academic Year</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const tableEl = panelEl.querySelector('#ay-table-target');
  const overlayEl = panelEl.querySelector('#ay-modal-overlay');
  const formEl = panelEl.querySelector('#ay-form');
  const titleEl = panelEl.querySelector('#ay-modal-title');
  const errorEl = panelEl.querySelector('#ay-modal-error');
  const saveBtnEl = panelEl.querySelector('#ay-save-btn');

  let cache = [];
  let editingId = null;

  function openModal(year) {
    editingId = year ? year.academic_year_id : null;
    errorEl.hidden = true;
    formEl.reset();

    const isEdit = Boolean(year);
    titleEl.textContent = isEdit ? 'Edit Academic Year' : 'Add Academic Year';

    if (isEdit) {
      formEl.elements.year_name.value = year.year_name || '';
      formEl.elements.status.value = year.status || 'Active';
      formEl.elements.start_date.value = fmtDate(year.start_date);
      formEl.elements.end_date.value = fmtDate(year.end_date);
    } else {
      formEl.elements.status.value = 'Active';
    }

    overlayEl.hidden = false;
  }

  function closeModal() {
    overlayEl.hidden = true;
    editingId = null;
  }

  panelEl.querySelector('#add-ay-btn').addEventListener('click', () => openModal(null));
  panelEl.querySelector('#ay-modal-close').addEventListener('click', closeModal);
  panelEl.querySelector('#ay-cancel-btn').addEventListener('click', closeModal);
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
        await academicYearsApi.update(editingId, payload);
        toast.success('Academic year updated successfully');
      } else {
        await academicYearsApi.create(payload);
        toast.success('Academic year created successfully');
      }
      closeModal();
      await load();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    } finally {
      saveBtnEl.disabled = false;
    }
  });

  async function handleDelete(year) {
    const confirmed = await confirmDelete({
      title: `Delete academic year "${year.year_name}"?`,
      text: 'This action cannot be undone.',
    });
    if (!confirmed) return;
    try {
      await academicYearsApi.remove(year.academic_year_id);
      toast.success('Academic year deleted successfully');
      await load();
    } catch (err) {
      toast.error(`Failed to delete academic year: ${err.message}`);
    }
  }

  function renderTable(years) {
    if (!years.length) {
      tableEl.innerHTML = '<div class="state-msg">No academic years yet.</div>';
      return;
    }

    const rows = years.map((y) => `
      <tr>
        <td>${y.year_name}</td>
        <td>${fmtDate(y.start_date) || '—'}</td>
        <td>${fmtDate(y.end_date) || '—'}</td>
        <td>${renderStatus(y.status)}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-icon" data-action="edit" data-id="${y.academic_year_id}" type="button" title="Edit">${icon('edit')}</button>
            <button class="btn btn-icon btn-danger" data-action="delete" data-id="${y.academic_year_id}" type="button" title="Delete">${icon('trash')}</button>
          </div>
        </td>
      </tr>
    `).join('');

    tableEl.innerHTML = `
      <table>
        <thead>
          <tr><th>Year</th><th>Start Date</th><th>End Date</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    tableEl.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const year = cache.find((y) => String(y.academic_year_id) === btn.dataset.id);
        if (year) openModal(year);
      });
    });
    tableEl.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const year = cache.find((y) => String(y.academic_year_id) === btn.dataset.id);
        if (year) handleDelete(year);
      });
    });
  }

  async function load() {
    tableEl.innerHTML = '<div class="state-msg">Loading academic years…</div>';
    try {
      cache = await academicYearsApi.list();
      renderTable(cache);
    } catch (err) {
      tableEl.innerHTML = `<div class="state-msg error">Failed to load academic years: ${err.message}</div>`;
    }
  }

  await load();
}

// ---------- TIME SLOTS ----------
async function setupTimeSlots(panelEl) {
  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div><h3>Time Slots</h3></div>
        <button class="btn btn-primary" id="add-ts-btn" type="button">${icon('add')} Add Time Slot</button>
      </div>
      <div id="ts-table-target"></div>
    </div>

    <div class="modal-overlay" id="ts-modal-overlay" hidden>
      <div class="modal">
        <div class="modal-header">
          <h3 id="ts-modal-title">Add Time Slot</h3>
          <button class="modal-close" id="ts-modal-close" type="button">${icon('close')}</button>
        </div>
        <div class="modal-error" id="ts-modal-error" hidden></div>
        <form id="ts-form" novalidate>
          <div class="form-grid">
            <div class="form-group">
              <label>Day of Week</label>
              <select name="day_of_week" required>
                <option value="">— Select —</option>
                ${DAY_OPTIONS.map((d) => `<option value="${d}">${d}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"></div>
            <div class="form-group">
              <label>Start Time</label>
              <input type="time" name="start_time" required>
            </div>
            <div class="form-group">
              <label>End Time</label>
              <input type="time" name="end_time" required>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="ts-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="ts-save-btn">Save Time Slot</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const tableEl = panelEl.querySelector('#ts-table-target');
  const overlayEl = panelEl.querySelector('#ts-modal-overlay');
  const formEl = panelEl.querySelector('#ts-form');
  const titleEl = panelEl.querySelector('#ts-modal-title');
  const errorEl = panelEl.querySelector('#ts-modal-error');
  const saveBtnEl = panelEl.querySelector('#ts-save-btn');

  let cache = [];
  let editingId = null;

  function openModal(slot) {
    editingId = slot ? slot.time_slot_id : null;
    errorEl.hidden = true;
    formEl.reset();

    const isEdit = Boolean(slot);
    titleEl.textContent = isEdit ? 'Edit Time Slot' : 'Add Time Slot';

    if (isEdit) {
      formEl.elements.day_of_week.value = slot.day_of_week || '';
      formEl.elements.start_time.value = slot.start_time ? String(slot.start_time).slice(0, 5) : '';
      formEl.elements.end_time.value = slot.end_time ? String(slot.end_time).slice(0, 5) : '';
    }

    overlayEl.hidden = false;
  }

  function closeModal() {
    overlayEl.hidden = true;
    editingId = null;
  }

  panelEl.querySelector('#add-ts-btn').addEventListener('click', () => openModal(null));
  panelEl.querySelector('#ts-modal-close').addEventListener('click', closeModal);
  panelEl.querySelector('#ts-cancel-btn').addEventListener('click', closeModal);
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
        await timeSlotsApi.update(editingId, payload);
        toast.success('Time slot updated successfully');
      } else {
        await timeSlotsApi.create(payload);
        toast.success('Time slot created successfully');
      }
      closeModal();
      await load();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    } finally {
      saveBtnEl.disabled = false;
    }
  });

  async function handleDelete(slot) {
    const label = `${slot.day_of_week} ${fmtTime(slot.start_time)}–${fmtTime(slot.end_time)}`;
    const confirmed = await confirmDelete({
      title: `Delete time slot "${label}"?`,
      text: 'This action cannot be undone.',
    });
    if (!confirmed) return;
    try {
      await timeSlotsApi.remove(slot.time_slot_id);
      toast.success('Time slot deleted successfully');
      await load();
    } catch (err) {
      toast.error(`Failed to delete time slot: ${err.message}`);
    }
  }

  function renderTable(slots) {
    if (!slots.length) {
      tableEl.innerHTML = '<div class="state-msg">No time slots yet.</div>';
      return;
    }

    const rows = slots.map((s) => `
      <tr>
        <td>${s.day_of_week}</td>
        <td>${fmtTime(s.start_time)}</td>
        <td>${fmtTime(s.end_time)}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-icon" data-action="edit" data-id="${s.time_slot_id}" type="button" title="Edit">${icon('edit')}</button>
            <button class="btn btn-icon btn-danger" data-action="delete" data-id="${s.time_slot_id}" type="button" title="Delete">${icon('trash')}</button>
          </div>
        </td>
      </tr>
    `).join('');

    tableEl.innerHTML = `
      <table>
        <thead>
          <tr><th>Day</th><th>Start Time</th><th>End Time</th><th></th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    tableEl.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slot = cache.find((s) => String(s.time_slot_id) === btn.dataset.id);
        if (slot) openModal(slot);
      });
    });
    tableEl.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slot = cache.find((s) => String(s.time_slot_id) === btn.dataset.id);
        if (slot) handleDelete(slot);
      });
    });
  }

  async function load() {
    tableEl.innerHTML = '<div class="state-msg">Loading time slots…</div>';
    try {
      cache = await timeSlotsApi.list();
      renderTable(cache);
    } catch (err) {
      tableEl.innerHTML = `<div class="state-msg error">Failed to load time slots: ${err.message}</div>`;
    }
  }

  await load();
}

// ---------- SEMESTERS ----------
async function setupSemesters(panelEl) {
  panelEl.innerHTML = `
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

  const tableEl = panelEl.querySelector('#semesters-table-target');
  const overlayEl = panelEl.querySelector('#semester-modal-overlay');
  const formEl = panelEl.querySelector('#semester-form');
  const titleEl = panelEl.querySelector('#semester-modal-title');
  const errorEl = panelEl.querySelector('#semester-modal-error');
  const yearEl = panelEl.querySelector('#semester-academic-year');
  const saveBtnEl = panelEl.querySelector('#semester-save-btn');

  let cache = [];
  // Academic years pulled from /api/v1/academic-year so the dropdown always
  // matches the real seeded ids instead of a hard-coded list.
  let academicYears = [];
  let editingId = null;

  function renderAcademicYearOptions(selectedId) {
    const options = academicYears
      .map((y) => `<option value="${y.academic_year_id}">${y.year_name}</option>`)
      .join('');
    yearEl.innerHTML = `<option value="">— Select —</option>${options}`;
    if (selectedId != null) yearEl.value = String(selectedId);
  }

  async function loadAcademicYears() {
    try {
      academicYears = await academicYearsApi.list();
    } catch (err) {
      academicYears = [];
      toast.error(`Failed to load academic years: ${err.message}`);
    }
    renderAcademicYearOptions(null);
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

  panelEl.querySelector('#add-semester-btn').addEventListener('click', () => openModal(null));
  panelEl.querySelector('#semester-modal-close').addEventListener('click', closeModal);
  panelEl.querySelector('#semester-cancel-btn').addEventListener('click', closeModal);
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
      await load();
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
      await load();
    } catch (err) {
      toast.error(`Failed to delete semester: ${err.message}`);
    }
  }

  function renderTable(semesters) {
    if (!semesters.length) {
      tableEl.innerHTML = '<div class="state-msg">No semesters yet.</div>';
      return;
    }

    const yearName = (s) => {
      if (s.AcademicYear) return s.AcademicYear.year_name;
      const match = academicYears.find((y) => String(y.academic_year_id) === String(s.academic_year_id));
      return match ? match.year_name : '—';
    };

    const rows = semesters.map((s) => `
      <tr>
        <td>${s.semester_name}</td>
        <td>${yearName(s)}</td>
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
        const semester = cache.find((s) => String(s.semester_id) === btn.dataset.id);
        if (semester) openModal(semester);
      });
    });
    tableEl.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const semester = cache.find((s) => String(s.semester_id) === btn.dataset.id);
        if (semester) handleDelete(semester);
      });
    });
  }

  async function load() {
    tableEl.innerHTML = '<div class="state-msg">Loading semesters…</div>';
    try {
      cache = await semestersApi.list();
      renderTable(cache);
    } catch (err) {
      tableEl.innerHTML = `<div class="state-msg error">Failed to load semesters: ${err.message}</div>`;
    }
  }

  await Promise.all([loadAcademicYears(), load()]);
}
