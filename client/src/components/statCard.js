import { icon } from './icons.js';

const STAT_META = {
  totalStudents: { title: 'Total students', icon: 'students' },
  teachers: { title: 'Teachers', icon: 'teachers' },
  attendanceToday: { title: 'Attendance today', icon: 'checkCircle' },
  outstandingFees: { title: 'Outstanding fees', icon: 'billing' },
};

function formatValue(stat) {
  const num = stat.isCount || stat.suffix === '%' ? stat.value : stat.value.toLocaleString();
  return `${stat.prefix || ''}${num}${stat.suffix || ''}`;
}

function formatTrend(stat) {
  const sign = stat.trend > 0 ? '+' : '';
  const amount = stat.isCount ? `${sign}${stat.trend}` : `${sign}${stat.trend}%`;
  return `${amount} <span class="muted-part">${stat.label}</span>`;
}

function renderStatCard(key, stat) {
  const meta = STAT_META[key] || { title: key, icon: 'dashboard' };
  return `
    <div class="card stat-card">
      <div class="stat-top">
        <div class="stat-title">${meta.title}</div>
        <div class="stat-icon">${icon(meta.icon)}</div>
      </div>
      <div class="stat-value">${formatValue(stat)}</div>
      <div class="stat-trend ${stat.direction}">
        ${icon(stat.direction === 'up' ? 'trendUp' : 'trendDown')}
        ${formatTrend(stat)}
      </div>
    </div>
  `;
}

// stats: dashboardMock.stats shape — { totalStudents, teachers, attendanceToday, outstandingFees }
export function renderStatGrid(containerEl, stats) {
  containerEl.innerHTML = Object.entries(stats).map(([key, stat]) => renderStatCard(key, stat)).join('');
}
