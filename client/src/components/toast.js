import { icon } from './icons.js';

// Reusable toast notifications. Call toast.success('Saved'), toast.error(...),
// or the generic toast.show(message, { type, duration }). Toasts stack in a
// bottom-right container that is created lazily on first use.
const ICONS = { success: 'checkCircle', error: 'warning', info: 'bell' };
const DEFAULT_DURATION = 3200;

let containerEl = null;

function getContainer() {
  if (!containerEl) {
    containerEl = document.createElement('div');
    containerEl.className = 'toast-container';
    document.body.appendChild(containerEl);
  }
  return containerEl;
}

function dismiss(el) {
  if (!el.parentNode) return;
  el.classList.remove('toast--in');
  el.classList.add('toast--out');
  el.addEventListener('transitionend', () => el.remove(), { once: true });
}

function show(message, { type = 'info', duration = DEFAULT_DURATION } = {}) {
  const container = getContainer();

  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.setAttribute('role', 'status');
  el.innerHTML = `
    <span class="toast-icon">${icon(ICONS[type] || ICONS.info)}</span>
    <span class="toast-msg"></span>
    <button class="toast-close" type="button" title="Dismiss">${icon('close')}</button>
  `;
  el.querySelector('.toast-msg').textContent = message;
  el.querySelector('.toast-close').addEventListener('click', () => dismiss(el));

  container.appendChild(el);
  // Next frame so the entrance transition runs.
  requestAnimationFrame(() => el.classList.add('toast--in'));

  if (duration > 0) setTimeout(() => dismiss(el), duration);
  return el;
}

export const toast = {
  show,
  success: (message, opts) => show(message, { ...opts, type: 'success' }),
  error: (message, opts) => show(message, { ...opts, type: 'error' }),
  info: (message, opts) => show(message, { ...opts, type: 'info' }),
};
