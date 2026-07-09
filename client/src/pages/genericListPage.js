import { renderTable, renderTableError } from '../components/table.js';

// Renders a description + table card for any entry in listPagesConfig.js.
export async function renderGenericListPage(contentEl, pageConfig) {
  contentEl.innerHTML = `
    <p class="placeholder-desc">${pageConfig.description}</p>
    <div class="card">
      <div class="card-header"><div><h3>${pageConfig.title}</h3></div></div>
      <div id="list-table-target"></div>
    </div>
  `;

  const tableEl = contentEl.querySelector('#list-table-target');

  try {
    const rows = await pageConfig.api.list();
    renderTable(tableEl, pageConfig.columns, rows);
  } catch (err) {
    renderTableError(tableEl, `Failed to load ${pageConfig.title.toLowerCase()}: ${err.message}`);
  }
}
