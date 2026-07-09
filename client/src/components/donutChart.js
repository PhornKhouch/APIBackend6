// attendanceToday: { presentPct, segments: [{ name, pct, color }] }
export function renderDonut(donutEl, legendEl, attendanceToday) {
  const { presentPct, segments } = attendanceToday;

  let cursor = 0;
  const stops = segments.map((seg) => {
    const start = cursor;
    cursor += seg.pct;
    return `${seg.color} ${start}% ${cursor}%`;
  });

  donutEl.style.background = `conic-gradient(${stops.join(', ')})`;
  donutEl.innerHTML = `
    <div class="donut-center">
      <div class="pct">${presentPct}%</div>
      <div class="lbl">present</div>
    </div>
  `;

  legendEl.innerHTML = segments.map((seg) => `
    <div class="item">
      <span class="dot" style="background:${seg.color}"></span>
      <span class="name">${seg.name}</span>
      <span class="pctval">${seg.pct}%</span>
    </div>
  `).join('');
}
