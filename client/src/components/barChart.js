// data: [{ label, enrolled, attendance }]
export function renderBarChart(containerEl, data) {
  containerEl.innerHTML = data.map((m) => `
    <div class="bar-col">
      <div class="bar-stack">
        <div class="bar-seg-att" style="height:${m.attendance * 0.55}px"></div>
        <div class="bar-seg-enr" style="height:${m.enrolled * 0.9}px"></div>
      </div>
      <div class="bar-month">${m.label}</div>
    </div>
  `).join('');
}
