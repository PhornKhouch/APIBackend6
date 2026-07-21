import { scheduleApi } from '../api/scheduleApi.js';
import { classesApi } from '../api/classesApi.js';
import { subjectsApi } from '../api/subjectsApi.js';
import { teachersApi } from '../api/teachersApi.js';
import { timeSlotsApi } from '../api/timeSlotsApi.js';
import { studentsApi } from '../api/studentsApi.js';
import { icon } from '../components/icons.js';
import { toast } from '../components/toast.js';
import { confirmDelete } from '../components/confirmDialog.js';

// Weekday order + short/long labels for the timetable columns.
const DAYS = [
  { key: 'Mon', label: 'Monday' },
  { key: 'Tue', label: 'Tuesday' },
  { key: 'Wed', label: 'Wednesday' },
  { key: 'Thu', label: 'Thursday' },
  { key: 'Fri', label: 'Friday' },
  { key: 'Sat', label: 'Saturday' },
  { key: 'Sun', label: 'Sunday' },
];

const teacherName = (t) => (t ? `${t.first_name || ''} ${t.last_name || ''}`.trim() : '');
const studentName = (s) => (s ? `${s.first_name || ''} ${s.last_name || ''}`.trim() : '');
// "08:00:00" -> "08:00"
const shortTime = (t) => (t ? String(t).slice(0, 5) : '');

// The timetable's weekly grid: rows are periods (distinct start times), columns
// are weekdays, each populated cell shows the subject + teacher for that class.
// A class-filter badge row across the top swaps which class's timetable shows.
export async function renderSchedulePage(contentEl) {
  contentEl.innerHTML = `
    <p class="placeholder-desc">Timetable &amp; room allocation.</p>

    <div id="schedule-filter" class="filter-badges"></div>

    <div class="card">
      <div class="card-header">
        <div><h3>Weekly Schedule</h3></div>
        <button class="btn btn-primary" id="add-schedule-btn" type="button">${icon('add')} Add Entry</button>
      </div>
      <div id="timetable-target"></div>
    </div>

    <div class="modal-overlay" id="schedule-modal-overlay" hidden>
      <div class="modal">
        <div class="modal-header">
          <h3 id="schedule-modal-title">Add Entry</h3>
          <button class="modal-close" id="schedule-modal-close" type="button">${icon('close')}</button>
        </div>
        <div class="modal-error" id="schedule-modal-error" hidden></div>
        <form id="schedule-form" novalidate>
          <div class="form-grid">
            <div class="form-group">
              <label>Class</label>
              <select name="class_id" id="schedule-class" required><option value="">— Select —</option></select>
            </div>
            <div class="form-group">
              <label>Subject</label>
              <select name="subject_id" id="schedule-subject" required><option value="">— Select —</option></select>
            </div>
            <div class="form-group">
              <label>Teacher</label>
              <select name="teacher_id" id="schedule-teacher" required><option value="">— Select —</option></select>
            </div>
            <div class="form-group">
              <label>Time Slot</label>
              <select name="time_slot_id" id="schedule-timeslot" required><option value="">— Select —</option></select>
            </div>
            <div class="form-group">
              <label>Room Number</label>
              <input type="text" name="room_number">
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-danger" id="schedule-delete-btn" hidden>Delete</button>
            <button type="button" class="btn btn-secondary" id="schedule-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="schedule-save-btn">Save Entry</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Floating action button shown on right-click of a populated cell -->
    <button type="button" class="ctx-fab" id="assign-fab" hidden>
      ${icon('personAdd')} Assign Student
    </button>

    <div class="modal-overlay" id="assign-modal-overlay" hidden>
      <div class="modal">
        <div class="modal-header">
          <h3 id="assign-modal-title">Assign Students</h3>
          <button class="modal-close" id="assign-modal-close" type="button">${icon('close')}</button>
        </div>
        <div class="modal-error" id="assign-modal-error" hidden></div>
        <p class="assign-context" id="assign-context"></p>
        <input type="text" class="assign-search" id="assign-search" placeholder="Search students…">
        <div class="assign-list" id="assign-list"></div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="assign-cancel-btn">Cancel</button>
          <button type="button" class="btn btn-primary" id="assign-save-btn">Save Assignments</button>
        </div>
      </div>
    </div>
  `;

  const filterEl = contentEl.querySelector('#schedule-filter');
  const gridEl = contentEl.querySelector('#timetable-target');
  const overlayEl = contentEl.querySelector('#schedule-modal-overlay');
  const formEl = contentEl.querySelector('#schedule-form');
  const modalTitleEl = contentEl.querySelector('#schedule-modal-title');
  const errorEl = contentEl.querySelector('#schedule-modal-error');
  const classSelEl = contentEl.querySelector('#schedule-class');
  const subjectSelEl = contentEl.querySelector('#schedule-subject');
  const teacherSelEl = contentEl.querySelector('#schedule-teacher');
  const timeslotSelEl = contentEl.querySelector('#schedule-timeslot');
  const saveBtnEl = contentEl.querySelector('#schedule-save-btn');
  const deleteBtnEl = contentEl.querySelector('#schedule-delete-btn');

  const fabEl = contentEl.querySelector('#assign-fab');
  const assignOverlayEl = contentEl.querySelector('#assign-modal-overlay');
  const assignTitleEl = contentEl.querySelector('#assign-modal-title');
  const assignContextEl = contentEl.querySelector('#assign-context');
  const assignErrorEl = contentEl.querySelector('#assign-modal-error');
  const assignSearchEl = contentEl.querySelector('#assign-search');
  const assignListEl = contentEl.querySelector('#assign-list');
  const assignSaveBtnEl = contentEl.querySelector('#assign-save-btn');

  let schedules = [];
  let classes = [];
  let subjects = [];
  let teachers = [];
  let timeSlots = [];
  let students = [];
  let activeClassId = null;
  let editingId = null;
  // Schedule entry the floating "Assign Student" button currently targets.
  let fabTargetEntry = null;
  // student_ids checked in the open assign panel.
  let assignSelected = new Set();
  let assigningId = null;

  const classId = (c) => c.class_id;
  const className = (c) => c.class_name;
  // Stable color bucket per subject so a subject keeps its accent colour across
  // cells (0-7 map to the .subj-N classes defined in components.css).
  const subjectColor = (id) => `subj-${(Number(id) || 0) % 8}`;

  async function loadReferenceData() {
    const [cls, subs, tchrs, slots, studs] = await Promise.all([
      classesApi.list().catch(() => []),
      subjectsApi.list().catch(() => []),
      teachersApi.list().catch(() => []),
      timeSlotsApi.list().catch(() => []),
      studentsApi.list().catch(() => []),
    ]);
    classes = cls || [];
    subjects = subs || [];
    teachers = tchrs || [];
    timeSlots = slots || [];
    students = studs || [];
  }

  function renderFilterBadges() {
    if (!classes.length) {
      filterEl.innerHTML = '';
      return;
    }
    filterEl.innerHTML = classes
      .map(
        (c) => `<button type="button" class="filter-badge${
          String(classId(c)) === String(activeClassId) ? ' active' : ''
        }" data-class-id="${classId(c)}">${className(c)}</button>`
      )
      .join('');

    filterEl.querySelectorAll('.filter-badge').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeClassId = btn.dataset.classId;
        renderFilterBadges();
        renderTimetable();
      });
    });
  }

  // Distinct periods across all time slots, sorted by start time. Each period is
  // a start_time; the matching cell for a day is the slot with that start_time on
  // that weekday.
  function derivePeriods() {
    const seen = new Map();
    timeSlots.forEach((s) => {
      const start = shortTime(s.start_time);
      if (!seen.has(start)) seen.set(start, { start, end: shortTime(s.end_time) });
    });
    return [...seen.values()].sort((a, b) => a.start.localeCompare(b.start));
  }

  // Only show weekday columns that actually have time slots (falls back to
  // Mon-Fri when slots exist but none carry a recognised day).
  function deriveDays() {
    const present = new Set(timeSlots.map((s) => s.day_of_week));
    const active = DAYS.filter((d) => present.has(d.key));
    return active.length ? active : DAYS.slice(0, 5);
  }

  function findEntry(dayKey, start) {
    return schedules.find((s) => {
      if (String(s.class_id) !== String(activeClassId)) return false;
      const slot = s.TimeSlot;
      return slot && slot.day_of_week === dayKey && shortTime(slot.start_time) === start;
    });
  }

  function cellHtml(dayKey, period) {
    const entry = findEntry(dayKey, period.start);
    if (!entry) {
      return `<td class="tt-cell tt-empty" data-day="${dayKey}" data-start="${period.start}"></td>`;
    }
    const subjectName = entry.Subject ? entry.Subject.subject_name : '—';
    const tName = teacherName(entry.Teacher);
    const room = entry.room_number ? `<span class="tt-room">${entry.room_number}</span>` : '';
    return `
      <td class="tt-cell" data-schedule-id="${entry.schedule_id}">
        <div class="tt-entry ${subjectColor(entry.subject_id)}">
          <div class="tt-subject">${subjectName}</div>
          <div class="tt-teacher">${tName || '—'}</div>
          ${room}
        </div>
      </td>`;
  }

  function renderTimetable() {
    const periods = derivePeriods();
    const days = deriveDays();

    if (!activeClassId) {
      gridEl.innerHTML = '<div class="state-msg">Select a class to view its timetable.</div>';
      return;
    }
    if (!periods.length) {
      gridEl.innerHTML = '<div class="state-msg">No time slots defined yet. Add time slots in Setup first.</div>';
      return;
    }

    const headCols = days.map((d) => `<th>${d.label}</th>`).join('');
    const rows = periods
      .map((period, i) => {
        const cells = days.map((d) => cellHtml(d.key, period)).join('');
        return `
          <tr>
            <td class="tt-period">
              <div class="tt-period-name">P${i + 1}</div>
              <div class="tt-period-time">${period.start}</div>
            </td>
            ${cells}
          </tr>`;
      })
      .join('');

    gridEl.innerHTML = `
      <div class="timetable-scroll">
        <table class="timetable">
          <thead><tr><th class="tt-period-head">Period</th>${headCols}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    gridEl.querySelectorAll('[data-schedule-id]').forEach((cell) => {
      cell.addEventListener('click', () => {
        const entry = schedules.find((s) => String(s.schedule_id) === cell.dataset.scheduleId);
        if (entry) openModal(entry);
      });
      // Right-click a populated cell to reveal the "Assign Student" FAB near the
      // pointer, pinned to that schedule entry.
      cell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const entry = schedules.find((s) => String(s.schedule_id) === cell.dataset.scheduleId);
        if (entry) showFab(e.clientX, e.clientY, entry);
      });
    });
    gridEl.querySelectorAll('.tt-empty').forEach((cell) => {
      cell.addEventListener('click', () => {
        openModal(null, { day: cell.dataset.day, start: cell.dataset.start });
      });
    });
  }

  function renderSelectOptions(el, items, valueKey, labelFn, selectedId, placeholder) {
    const opts = items
      .map((it) => `<option value="${it[valueKey]}">${labelFn(it)}</option>`)
      .join('');
    el.innerHTML = `<option value="">${placeholder}</option>${opts}`;
    if (selectedId != null) el.value = String(selectedId);
  }

  function timeSlotLabel(s) {
    const day = DAYS.find((d) => d.key === s.day_of_week);
    return `${day ? day.label : s.day_of_week} · ${shortTime(s.start_time)}–${shortTime(s.end_time)}`;
  }

  // prefill: when adding from an empty cell, preselect the class + the time slot
  // matching the clicked day/period so the entry lands where the user clicked.
  function openModal(entry, prefill = null) {
    editingId = entry ? entry.schedule_id : null;
    errorEl.hidden = true;
    formEl.reset();
    modalTitleEl.textContent = entry ? 'Edit Entry' : 'Add Entry';
    deleteBtnEl.hidden = !entry;

    let slotId = entry ? entry.time_slot_id : null;
    if (!entry && prefill) {
      const slot = timeSlots.find(
        (s) => s.day_of_week === prefill.day && shortTime(s.start_time) === prefill.start
      );
      if (slot) slotId = slot.time_slot_id;
    }

    renderSelectOptions(classSelEl, classes, 'class_id', className,
      entry ? entry.class_id : activeClassId, '— Select —');
    renderSelectOptions(subjectSelEl, subjects, 'subject_id', (s) => s.subject_name,
      entry ? entry.subject_id : null, '— Select —');
    renderSelectOptions(teacherSelEl, teachers, 'teacher_id', teacherName,
      entry ? entry.teacher_id : null, '— Select —');
    renderSelectOptions(timeslotSelEl, timeSlots, 'time_slot_id', timeSlotLabel,
      slotId, '— Select —');

    if (entry) formEl.elements.room_number.value = entry.room_number || '';

    overlayEl.hidden = false;
  }

  function closeModal() {
    overlayEl.hidden = true;
    editingId = null;
  }

  // ---- Floating "Assign Student" button + student picker panel ----

  function entryLabel(entry) {
    const subject = entry.Subject ? entry.Subject.subject_name : 'Subject';
    const slot = entry.TimeSlot;
    const when = slot ? timeSlotLabel(slot) : '';
    return when ? `${subject} · ${when}` : subject;
  }

  function showFab(x, y, entry) {
    fabTargetEntry = entry;
    fabEl.hidden = false;
    // Keep the button on-screen by clamping to the viewport.
    const rect = fabEl.getBoundingClientRect();
    const left = Math.min(x, window.innerWidth - rect.width - 12);
    const top = Math.min(y, window.innerHeight - rect.height - 12);
    fabEl.style.left = `${Math.max(12, left)}px`;
    fabEl.style.top = `${Math.max(12, top)}px`;
  }

  function hideFab() {
    fabEl.hidden = true;
    fabTargetEntry = null;
  }

  function renderAssignList() {
    const query = assignSearchEl.value.trim().toLowerCase();
    const matches = students.filter((s) => {
      if (!query) return true;
      return studentName(s).toLowerCase().includes(query);
    });

    if (!students.length) {
      assignListEl.innerHTML = '<div class="state-msg">No students available.</div>';
      return;
    }
    if (!matches.length) {
      assignListEl.innerHTML = '<div class="state-msg">No students match your search.</div>';
      return;
    }

    assignListEl.innerHTML = matches
      .map((s) => {
        const id = s.student_id;
        const checked = assignSelected.has(String(id)) ? 'checked' : '';
        return `
          <label class="assign-item">
            <input type="checkbox" data-student-id="${id}" ${checked}>
            <span>${studentName(s) || `Student #${id}`}</span>
          </label>`;
      })
      .join('');

    assignListEl.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const id = cb.dataset.studentId;
        if (cb.checked) assignSelected.add(id);
        else assignSelected.delete(id);
      });
    });
  }

  async function openAssignModal(entry) {
    hideFab();
    assigningId = entry.schedule_id;
    assignSelected = new Set();
    assignErrorEl.hidden = true;
    assignSearchEl.value = '';
    assignTitleEl.textContent = 'Assign Students';
    assignContextEl.textContent = entryLabel(entry);
    assignListEl.innerHTML = '<div class="state-msg">Loading students…</div>';
    assignOverlayEl.hidden = false;

    try {
      const assignments = await scheduleApi.listStudents(entry.schedule_id);
      (assignments || []).forEach((a) => assignSelected.add(String(a.student_id)));
    } catch (err) {
      assignErrorEl.textContent = `Failed to load current assignments: ${err.message}`;
      assignErrorEl.hidden = false;
    }
    renderAssignList();
  }

  function closeAssignModal() {
    assignOverlayEl.hidden = true;
    assigningId = null;
  }

  fabEl.addEventListener('click', () => {
    if (fabTargetEntry) openAssignModal(fabTargetEntry);
  });
  // Dismiss the FAB on any outside interaction. Self-remove once the page (and
  // its FAB) has been swapped out by the router, so listeners don't accumulate.
  function onDocClick(e) {
    if (!fabEl.isConnected) return document.removeEventListener('click', onDocClick);
    if (!fabEl.hidden && e.target !== fabEl && !fabEl.contains(e.target)) hideFab();
  }
  function onDocKeydown(e) {
    if (!fabEl.isConnected) return document.removeEventListener('keydown', onDocKeydown);
    if (e.key === 'Escape') hideFab();
  }
  document.addEventListener('click', onDocClick);
  document.addEventListener('keydown', onDocKeydown);

  assignSearchEl.addEventListener('input', renderAssignList);
  contentEl.querySelector('#assign-modal-close').addEventListener('click', closeAssignModal);
  contentEl.querySelector('#assign-cancel-btn').addEventListener('click', closeAssignModal);
  assignOverlayEl.addEventListener('click', (e) => {
    if (e.target === assignOverlayEl) closeAssignModal();
  });

  assignSaveBtnEl.addEventListener('click', async () => {
    if (!assigningId) return;
    assignErrorEl.hidden = true;
    assignSaveBtnEl.disabled = true;
    try {
      const ids = [...assignSelected].map(Number);
      await scheduleApi.setStudents(assigningId, ids);
      toast.success(`${ids.length} student${ids.length === 1 ? '' : 's'} assigned`);
      closeAssignModal();
    } catch (err) {
      assignErrorEl.textContent = err.message;
      assignErrorEl.hidden = false;
    } finally {
      assignSaveBtnEl.disabled = false;
    }
  });

  contentEl.querySelector('#add-schedule-btn').addEventListener('click', () => openModal(null));
  contentEl.querySelector('#schedule-modal-close').addEventListener('click', closeModal);
  contentEl.querySelector('#schedule-cancel-btn').addEventListener('click', closeModal);
  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl) closeModal();
  });

  deleteBtnEl.addEventListener('click', async () => {
    if (!editingId) return;
    const confirmed = await confirmDelete({
      title: 'Delete this schedule entry?',
      text: 'This action cannot be undone.',
    });
    if (!confirmed) return;
    try {
      await scheduleApi.remove(editingId);
      toast.success('Schedule entry deleted');
      closeModal();
      await loadSchedules();
    } catch (err) {
      toast.error(`Failed to delete entry: ${err.message}`);
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
        await scheduleApi.update(editingId, payload);
        toast.success('Schedule entry updated');
      } else {
        await scheduleApi.create(payload);
        toast.success('Schedule entry created');
      }
      closeModal();
      await loadSchedules();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    } finally {
      saveBtnEl.disabled = false;
    }
  });

  async function loadSchedules() {
    gridEl.innerHTML = '<div class="state-msg">Loading timetable…</div>';
    try {
      schedules = await scheduleApi.list();
      renderTimetable();
    } catch (err) {
      gridEl.innerHTML = `<div class="state-msg error">Failed to load schedule: ${err.message}</div>`;
    }
  }

  await loadReferenceData();
  if (classes.length) activeClassId = String(classId(classes[0]));
  renderFilterBadges();
  await loadSchedules();
}
