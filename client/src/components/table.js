const PILL_CLASS = {
  active: 'active-pill',
  paid: 'active-pill',
  present: 'active-pill',
  valid: 'active-pill',
  ready: 'active-pill',
  scheduled: 'active-pill',

  inactive: 'inactive-pill',
  overdue: 'inactive-pill',
  absent: 'inactive-pill',

  pending: 'pending-pill',
  expiring: 'pending-pill',
  processing: 'pending-pill',
};

export function renderStatus(value) {
  const pillClass = PILL_CLASS[String(value).toLowerCase()] || 'pending-pill';
  return `<span class="pill ${pillClass}">${value}</span>`;
}

// columns: [{ key, label, isStatus? }]
export function renderTable(containerEl, columns, rows) {
  if (!rows.length) {
    containerEl.innerHTML = '<div class="state-msg">No records yet.</div>';
    return;
  }

  const head = columns.map((c) => `<th>${c.label}</th>`).join('');
  const body = rows.map((row) => {
    const cells = columns.map((c) => {
      const value = row[c.key];
      return `<td>${c.isStatus ? renderStatus(value) : value}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  containerEl.innerHTML = `
    <table>
      <thead><tr>${head}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

export function renderTableError(containerEl, message) {
  containerEl.innerHTML = `<div class="state-msg error">${message}</div>`;
}
