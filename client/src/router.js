import { NAV_ITEMS } from './navConfig.js';
import { renderDashboardPage } from './pages/dashboard.js';
import { renderSetupPage } from './pages/setupPage.js';
import { renderStudentsPage } from './pages/studentsPage.js';
import { renderTeachersPage } from './pages/teachersPage.js';
import { renderSubjectsPage } from './pages/subjectsPage.js';
import { renderClassesPage } from './pages/classPage.js';
import { renderSchedulePage } from './pages/schedulePage.js';
import { renderBillingPage } from './pages/billingPage.js';
import { renderGenericListPage } from './pages/genericListPage.js';
import { LIST_PAGES } from './pages/listPagesConfig.js';
import { setPageTitle } from './components/topbar.js';

const TITLES = Object.fromEntries(NAV_ITEMS.map((item) => [item.key, item.label]));

// Sections with a dedicated screen (real CRUD, not the generic mock table).
const CUSTOM_PAGES = {
  dashboard: renderDashboardPage,
  setup: renderSetupPage,
  students: renderStudentsPage,
  teachers: renderTeachersPage,
  subjects: renderSubjectsPage,
  classes: renderClassesPage,
  schedule: renderSchedulePage,
  billing: renderBillingPage,
};

function getRenderer(sectionKey) {
  if (CUSTOM_PAGES[sectionKey]) return CUSTOM_PAGES[sectionKey];
  const pageConfig = LIST_PAGES[sectionKey];
  if (!pageConfig) return null;
  return (contentEl) => renderGenericListPage(contentEl, pageConfig);
}

export function createRouter({ contentEl, titleEl }) {
  return async function navigateTo(sectionKey) {
    const render = getRenderer(sectionKey);
    if (!render) return;

    setPageTitle(titleEl, TITLES[sectionKey] || sectionKey);
    contentEl.scrollTop = 0;
    await render(contentEl);
  };
}
