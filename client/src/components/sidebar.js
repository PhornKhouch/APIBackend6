import { NAV_ITEMS } from '../navConfig.js';
import { icon } from './icons.js';

// Renders the nav list into `navEl` and wires clicks to `onNavigate(key)`.
export function renderSidebarNav(navEl, onNavigate) {
  navEl.innerHTML = NAV_ITEMS.map((item) => `
    <div class="nav-item${item.key === 'dashboard' ? ' active' : ''}" data-section="${item.key}">
      ${icon(item.icon)}
      <span class="label">${item.label}</span>
      ${item.badgeKey ? `<span class="badge" data-badge="${item.badgeKey}" hidden></span>` : ''}
    </div>
  `).join('');

  navEl.querySelectorAll('.nav-item').forEach((el) => {
    el.addEventListener('click', () => {
      navEl.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
      el.classList.add('active');
      onNavigate(el.dataset.section);
    });
  });
}

// Sets a badge's count; hides it when count is falsy.
export function setBadge(navEl, badgeKey, count) {
  const badgeEl = navEl.querySelector(`[data-badge="${badgeKey}"]`);
  if (!badgeEl) return;
  if (count) {
    badgeEl.textContent = count;
    badgeEl.hidden = false;
  } else {
    badgeEl.hidden = true;
  }
}
