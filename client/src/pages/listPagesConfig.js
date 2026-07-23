import { attendanceApi } from '../api/attendanceApi.js';
import { billingApi } from '../api/billingApi.js';
import { certificationsApi } from '../api/certificationsApi.js';
import { reportsApi } from '../api/reportsApi.js';
import { usersApi } from '../api/usersApi.js';

// Drives js/pages/genericListPage.js — add a new section here (plus a nav
// entry in js/navConfig.js) to get a routable list page for free.
// Note: 'students', 'teachers', 'subjects', 'classes' and 'schedule' have
// outgrown this generic table and now have their own screens — see
// pages/{students,teachers,subjects,class,schedule}Page.js and router.js's
// CUSTOM_PAGES.
export const LIST_PAGES = {
  attendance: {
    title: 'Attendance',
    description: 'Track daily attendance across all classes.',
    api: attendanceApi,
    columns: [
      { key: 'student', label: 'Student' },
      { key: 'class', label: 'Class' },
      { key: 'status', label: 'Status', isStatus: true },
    ],
  },
  billing: {
    title: 'Billing',
    description: 'Track tuition payments and outstanding invoices.',
    api: billingApi,
    columns: [
      { key: 'student', label: 'Student' },
      { key: 'invoice', label: 'Invoice' },
      { key: 'status', label: 'Status', isStatus: true },
    ],
  },
  certifications: {
    title: 'Certifications',
    description: 'Manage staff and student certifications.',
    api: certificationsApi,
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'certification', label: 'Certification' },
      { key: 'status', label: 'Status', isStatus: true },
    ],
  },
  reports: {
    title: 'Reports',
    description: 'Generate academic and administrative reports.',
    api: reportsApi,
    columns: [
      { key: 'report', label: 'Report' },
      { key: 'period', label: 'Period' },
      { key: 'status', label: 'Status', isStatus: true },
    ],
  },
  users: {
    title: 'Users & Roles',
    description: 'Manage user accounts, roles, and permissions.',
    api: usersApi,
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status', isStatus: true },
    ],
  },
};
