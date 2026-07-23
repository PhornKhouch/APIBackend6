import { invoicesApi } from '../api/invoicesApi.js';
import { paymentsApi } from '../api/paymentsApi.js';
import { studentsApi } from '../api/studentsApi.js';
import { semestersApi } from '../api/semestersApi.js';
import { icon } from '../components/icons.js';
import { renderStatus } from '../components/table.js';
import { toast } from '../components/toast.js';

const PAYMENT_METHODS = ['Cash', 'ABA', 'BankTransfer', 'Check'];
const INVOICE_STATUSES = ['Unpaid', 'Partial', 'Paid', 'Overdue'];

const studentName = (s) => (s ? `${s.first_name || ''} ${s.last_name || ''}`.trim() : '');
const money = (v) => `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().slice(0, 10);

// Initials for the little table avatar, e.g. "Chenda Meas" -> "CM".
function initials(name) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

// Six-way deterministic avatar tint so rows read like the mockup without
// storing a colour per student.
function avatarVariant(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash + name.charCodeAt(i)) % 6;
  return hash;
}

// Full billing screen for node-api's /api/v1/invoice and /api/v1/payment
// endpoints — summary totals, an invoice table, invoice create/edit and a
// record-payment flow. Nothing is deleted here (invoices are voided by status,
// payments corrected by recording new ones).
export async function renderBillingPage(contentEl) {
  contentEl.innerHTML = `
    <p class="placeholder-desc">Tuition, invoices &amp; payment tracking.</p>

    <div class="billing-stats" id="billing-stats"></div>

    <div class="card">
      <div class="card-header">
        <div><h3>Invoices</h3><div class="sub">Student billing &amp; balances</div></div>
        <button class="btn btn-primary" id="add-invoice-btn" type="button">${icon('add')} New invoice</button>
      </div>
      <div id="billing-table-target"></div>
    </div>

    <div class="modal-overlay" id="invoice-modal-overlay" hidden>
      <div class="modal">
        <div class="modal-header">
          <h3 id="invoice-modal-title">New Invoice</h3>
          <button class="modal-close" id="invoice-modal-close" type="button">${icon('close')}</button>
        </div>
        <div class="modal-error" id="invoice-modal-error" hidden></div>
        <form id="invoice-form" novalidate>
          <div class="form-grid">
            <div class="form-group">
              <label>Student</label>
              <select name="student_id" id="invoice-student" required>
                <option value="">— Select —</option>
              </select>
            </div>
            <div class="form-group">
              <label>Semester</label>
              <select name="semester_id" id="invoice-semester" required>
                <option value="">— Select —</option>
              </select>
            </div>
            <div class="form-group">
              <label>Fee Structure ID</label>
              <input type="number" name="fee_id" min="1" placeholder="e.g. 1" required>
            </div>
            <div class="form-group">
              <label>Total Amount</label>
              <input type="number" name="total_amount" min="0" step="0.01" required>
            </div>
            <div class="form-group">
              <label>Issue Date</label>
              <input type="date" name="issue_date">
            </div>
            <div class="form-group">
              <label>Due Date</label>
              <input type="date" name="due_date">
            </div>
            <div class="form-group" id="invoice-status-group" hidden>
              <label>Status</label>
              <select name="status">
                ${INVOICE_STATUSES.map((s) => `<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="invoice-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="invoice-save-btn">Save Invoice</button>
          </div>
        </form>
      </div>
    </div>

    <div class="modal-overlay" id="payment-modal-overlay" hidden>
      <div class="modal">
        <div class="modal-header">
          <h3>Record Payment</h3>
          <button class="modal-close" id="payment-modal-close" type="button">${icon('close')}</button>
        </div>
        <div class="modal-error" id="payment-modal-error" hidden></div>
        <p class="assign-context" id="payment-context"></p>
        <form id="payment-form" novalidate>
          <div class="form-grid">
            <div class="form-group">
              <label>Amount</label>
              <input type="number" name="amount" min="0.01" step="0.01" required>
            </div>
            <div class="form-group">
              <label>Payment Method</label>
              <select name="payment_method" required>
                ${PAYMENT_METHODS.map((m) => `<option value="${m}">${m}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Payment Date</label>
              <input type="date" name="payment_date" required>
            </div>
            <div class="form-group">
              <label>Recorded By (User ID)</label>
              <input type="number" name="recorded_by" min="1" value="1" required>
            </div>
            <div class="form-group full">
              <label>Notes</label>
              <textarea name="notes"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="payment-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="payment-save-btn">Record Payment</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const statsEl = contentEl.querySelector('#billing-stats');
  const tableEl = contentEl.querySelector('#billing-table-target');

  const invOverlayEl = contentEl.querySelector('#invoice-modal-overlay');
  const invFormEl = contentEl.querySelector('#invoice-form');
  const invTitleEl = contentEl.querySelector('#invoice-modal-title');
  const invErrorEl = contentEl.querySelector('#invoice-modal-error');
  const invStudentEl = contentEl.querySelector('#invoice-student');
  const invSemesterEl = contentEl.querySelector('#invoice-semester');
  const invStatusGroupEl = contentEl.querySelector('#invoice-status-group');
  const invSaveBtnEl = contentEl.querySelector('#invoice-save-btn');

  const payOverlayEl = contentEl.querySelector('#payment-modal-overlay');
  const payFormEl = contentEl.querySelector('#payment-form');
  const payContextEl = contentEl.querySelector('#payment-context');
  const payErrorEl = contentEl.querySelector('#payment-modal-error');
  const paySaveBtnEl = contentEl.querySelector('#payment-save-btn');

  let invoicesCache = [];
  let students = [];
  let semesters = [];
  let editingId = null;
  let payingInvoice = null;

  const balanceOf = (inv) => Number(inv.total_amount || 0) - Number(inv.amount_paid || 0);
  const classOf = (inv) => (inv.FeeStructure && inv.FeeStructure.Class ? inv.FeeStructure.Class.class_name : '—');
  const nameOf = (inv) => (inv.Student ? studentName(inv.Student) : `Student #${inv.student_id}`);

  // ---- Summary cards ----

  function renderStats(invoices) {
    const totalBilled = invoices.reduce((sum, i) => sum + Number(i.total_amount || 0), 0);
    const collected = invoices.reduce((sum, i) => sum + Number(i.amount_paid || 0), 0);
    const outstanding = invoices.reduce((sum, i) => sum + Math.max(0, balanceOf(i)), 0);
    const overdue = invoices
      .filter((i) => i.status === 'Overdue')
      .reduce((sum, i) => sum + Math.max(0, balanceOf(i)), 0);

    const cards = [
      { label: 'Total billed', value: totalBilled, mod: '' },
      { label: 'Collected', value: collected, mod: 'is-collected' },
      { label: 'Outstanding', value: outstanding, mod: 'is-outstanding' },
      { label: 'Overdue', value: overdue, mod: 'is-overdue' },
    ];

    statsEl.innerHTML = cards
      .map(
        (c) => `
        <div class="card b-stat">
          <div class="b-stat-label">${c.label}</div>
          <div class="b-stat-value ${c.mod}">${money(c.value)}</div>
        </div>`
      )
      .join('');
  }

  // ---- Reference data for the invoice form dropdowns ----

  function renderStudentOptions(selectedId) {
    invStudentEl.innerHTML =
      '<option value="">— Select —</option>' +
      students
        .map((s) => `<option value="${s.student_id}">${studentName(s) || `Student #${s.student_id}`}</option>`)
        .join('');
    if (selectedId != null) invStudentEl.value = String(selectedId);
  }

  function renderSemesterOptions(selectedId) {
    invSemesterEl.innerHTML =
      '<option value="">— Select —</option>' +
      semesters.map((s) => `<option value="${s.semester_id}">${s.semester_name}</option>`).join('');
    if (selectedId != null) invSemesterEl.value = String(selectedId);
  }

  async function loadReferenceData() {
    const [studs, sems] = await Promise.all([
      studentsApi.list().catch(() => []),
      semestersApi.list().catch(() => []),
    ]);
    students = studs || [];
    semesters = sems || [];
  }

  // ---- Invoice modal ----

  function openInvoiceModal(invoice) {
    editingId = invoice ? invoice.invoice_id : null;
    const isEdit = Boolean(invoice);
    invErrorEl.hidden = true;
    invFormEl.reset();
    invTitleEl.textContent = isEdit ? 'Edit Invoice' : 'New Invoice';
    invStatusGroupEl.hidden = !isEdit;

    renderStudentOptions(isEdit ? invoice.student_id : null);
    renderSemesterOptions(isEdit ? invoice.semester_id : null);

    if (isEdit) {
      invFormEl.elements.fee_id.value = invoice.fee_id != null ? invoice.fee_id : '';
      invFormEl.elements.total_amount.value = invoice.total_amount != null ? invoice.total_amount : '';
      invFormEl.elements.issue_date.value = invoice.issue_date ? String(invoice.issue_date).slice(0, 10) : '';
      invFormEl.elements.due_date.value = invoice.due_date ? String(invoice.due_date).slice(0, 10) : '';
      invFormEl.elements.status.value = invoice.status || 'Unpaid';
    } else {
      invFormEl.elements.issue_date.value = today();
    }

    invOverlayEl.hidden = false;
  }

  function closeInvoiceModal() {
    invOverlayEl.hidden = true;
    editingId = null;
  }

  invFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!invFormEl.reportValidity()) return;

    invErrorEl.hidden = true;
    const payload = Object.fromEntries(new FormData(invFormEl).entries());
    Object.keys(payload).forEach((key) => {
      if (payload[key] === '') delete payload[key];
    });
    // Status is only meaningful when editing; the create form hides it.
    if (!editingId) delete payload.status;

    invSaveBtnEl.disabled = true;
    try {
      if (editingId) {
        await invoicesApi.update(editingId, payload);
        toast.success('Invoice updated successfully');
      } else {
        await invoicesApi.create(payload);
        toast.success('Invoice created successfully');
      }
      closeInvoiceModal();
      await loadInvoices();
    } catch (err) {
      invErrorEl.textContent = err.message;
      invErrorEl.hidden = false;
    } finally {
      invSaveBtnEl.disabled = false;
    }
  });

  // ---- Payment modal ----

  function openPaymentModal(invoice) {
    payingInvoice = invoice;
    payErrorEl.hidden = true;
    payFormEl.reset();
    payContextEl.textContent = `${nameOf(invoice)} · ${invoice.invoice_number} · balance ${money(balanceOf(invoice))}`;
    payFormEl.elements.amount.value = Math.max(0, balanceOf(invoice)).toFixed(2);
    payFormEl.elements.payment_date.value = today();
    payFormEl.elements.recorded_by.value = '1';
    payOverlayEl.hidden = false;
  }

  function closePaymentModal() {
    payOverlayEl.hidden = true;
    payingInvoice = null;
  }

  payFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!payingInvoice || !payFormEl.reportValidity()) return;

    payErrorEl.hidden = true;
    const payload = Object.fromEntries(new FormData(payFormEl).entries());
    Object.keys(payload).forEach((key) => {
      if (payload[key] === '') delete payload[key];
    });
    payload.invoice_id = payingInvoice.invoice_id;

    paySaveBtnEl.disabled = true;
    try {
      await paymentsApi.create(payload);
      toast.success('Payment recorded successfully');
      closePaymentModal();
      await loadInvoices();
    } catch (err) {
      payErrorEl.textContent = err.message;
      payErrorEl.hidden = false;
    } finally {
      paySaveBtnEl.disabled = false;
    }
  });

  // ---- Wiring ----

  contentEl.querySelector('#add-invoice-btn').addEventListener('click', () => openInvoiceModal(null));
  contentEl.querySelector('#invoice-modal-close').addEventListener('click', closeInvoiceModal);
  contentEl.querySelector('#invoice-cancel-btn').addEventListener('click', closeInvoiceModal);
  invOverlayEl.addEventListener('click', (e) => {
    if (e.target === invOverlayEl) closeInvoiceModal();
  });

  contentEl.querySelector('#payment-modal-close').addEventListener('click', closePaymentModal);
  contentEl.querySelector('#payment-cancel-btn').addEventListener('click', closePaymentModal);
  payOverlayEl.addEventListener('click', (e) => {
    if (e.target === payOverlayEl) closePaymentModal();
  });

  // ---- Invoice table ----

  function renderInvoiceTable(invoices) {
    if (!invoices.length) {
      tableEl.innerHTML = '<div class="state-msg">No invoices yet.</div>';
      return;
    }

    const rows = invoices
      .map((inv) => {
        const name = nameOf(inv);
        const balance = balanceOf(inv);
        const recordBtn =
          balance > 0
            ? `<button class="btn btn-secondary btn-record" data-action="pay" data-id="${inv.invoice_id}" type="button">Record payment</button>`
            : '';
        return `
        <tr>
          <td>
            <div class="cell-user">
              <span class="table-avatar av-${avatarVariant(name)}">${initials(name)}</span>
              <span>${name}</span>
            </div>
          </td>
          <td>${classOf(inv)}</td>
          <td class="mono">${inv.invoice_number}</td>
          <td>${money(inv.total_amount)}</td>
          <td>${balance > 0 ? `<span class="bal-due">${money(balance)}</span>` : '—'}</td>
          <td>${renderStatus(inv.status)}</td>
          <td class="ta-right">
            <div class="table-actions">
              ${recordBtn}
              <button class="btn btn-icon" data-action="edit" data-id="${inv.invoice_id}" type="button" title="Edit">${icon('edit')}</button>
            </div>
          </td>
        </tr>`;
      })
      .join('');

    tableEl.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Student</th><th>Class</th><th>Invoice</th>
            <th>Amount</th><th>Balance</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    tableEl.querySelectorAll('[data-action="pay"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const inv = invoicesCache.find((i) => String(i.invoice_id) === btn.dataset.id);
        if (inv) openPaymentModal(inv);
      });
    });
    tableEl.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const inv = invoicesCache.find((i) => String(i.invoice_id) === btn.dataset.id);
        if (inv) openInvoiceModal(inv);
      });
    });
  }

  async function loadInvoices() {
    tableEl.innerHTML = '<div class="state-msg">Loading invoices…</div>';
    try {
      invoicesCache = await invoicesApi.list();
      renderStats(invoicesCache);
      renderInvoiceTable(invoicesCache);
    } catch (err) {
      statsEl.innerHTML = '';
      tableEl.innerHTML = `<div class="state-msg error">Failed to load invoices: ${err.message}</div>`;
    }
  }

  await loadReferenceData();
  await loadInvoices();
}
