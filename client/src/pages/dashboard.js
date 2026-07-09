import { getDashboardOverview } from '../api/dashboardApi.js';
import { renderStatGrid } from '../components/statCard.js';
import { renderBarChart } from '../components/barChart.js';
import { renderDonut } from '../components/donutChart.js';
import { renderActivityList, renderAlertList } from '../components/lists.js';

const TEMPLATE = `
  <div class="stat-grid" id="dash-stats"></div>

  <div class="row-2">
    <div class="card">
      <div class="card-header">
        <div>
          <h3>Enrollment &amp; attendance</h3>
          <div class="sub">By month, this academic year</div>
        </div>
        <div class="legend">
          <div class="legend-item"><span class="legend-dot" style="background:var(--orange)"></span>Enrolled</div>
          <div class="legend-item"><span class="legend-dot" style="background:#4b5875"></span>Attendance %</div>
        </div>
      </div>
      <div class="bar-chart" id="dash-bar-chart"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <div>
          <h3>Attendance today</h3>
          <div class="sub">School-wide roll call</div>
        </div>
      </div>
      <div class="donut-wrap">
        <div class="donut" id="dash-donut"></div>
        <div class="donut-legend" id="dash-donut-legend"></div>
      </div>
    </div>
  </div>

  <div class="row-2">
    <div class="card">
      <div class="card-header"><div><h3>Recent activity</h3></div></div>
      <div id="dash-activity"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <div><h3>%WARNING_ICON% Needs attention</h3></div>
      </div>
      <div id="dash-alerts"></div>
    </div>
  </div>
`;

export async function renderDashboardPage(contentEl) {
  contentEl.innerHTML = TEMPLATE.replace(
    '%WARNING_ICON%',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>'
  );

  try {
    const data = await getDashboardOverview();

    renderStatGrid(contentEl.querySelector('#dash-stats'), data.stats);
    renderBarChart(contentEl.querySelector('#dash-bar-chart'), data.enrollmentByMonth);
    renderDonut(
      contentEl.querySelector('#dash-donut'),
      contentEl.querySelector('#dash-donut-legend'),
      data.attendanceToday
    );
    renderActivityList(contentEl.querySelector('#dash-activity'), data.recentActivity);
    renderAlertList(contentEl.querySelector('#dash-alerts'), data.needsAttention);
  } catch (err) {
    contentEl.innerHTML = `<div class="state-msg error">Failed to load dashboard: ${err.message}</div>`;
  }
}
