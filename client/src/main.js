import { renderSidebarNav } from './components/sidebar.js';
import { createRouter } from './router.js';
import { initThemeToggle } from './components/themeToggle.js';

document.addEventListener('DOMContentLoaded', () => {
  const navEl = document.getElementById('nav');
  const contentEl = document.getElementById('content');
  const titleEl = document.getElementById('page-title');

  const navigateTo = createRouter({ contentEl, titleEl });

  renderSidebarNav(navEl, navigateTo);
  navigateTo('dashboard');

  initThemeToggle(document.getElementById('theme-toggle'));

  // Admin/Teacher segmented toggle (visual only for now).
  document.querySelectorAll('.segmented button').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.segmented button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});
