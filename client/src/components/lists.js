import { icon } from './icons.js';

// items: [{ icon, title, time }]
export function renderActivityList(containerEl, items) {
  containerEl.innerHTML = items.map((item) => `
    <div class="list-row">
      <div class="icon-round">${icon(item.icon)}</div>
      <div class="list-text">
        <div class="title">${item.title}</div>
        <div class="time">${item.time}</div>
      </div>
    </div>
  `).join('');
}

// items: [{ color, title, sub }]
export function renderAlertList(containerEl, items) {
  containerEl.innerHTML = items.map((item) => `
    <div class="alert-row">
      <span class="status-dot" style="background:${item.color}"></span>
      <div class="alert-text">
        <div class="title">${item.title}</div>
        <div class="sub">${item.sub}</div>
      </div>
    </div>
  `).join('');
}
