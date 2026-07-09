import { studentsApi } from '../api/studentsApi.js';
import { classesApi } from '../api/classesApi.js';
import { scheduleApi } from '../api/scheduleApi.js';
import { attendanceApi } from '../api/attendanceApi.js';
import { billingApi } from '../api/billingApi.js';
import { certificationsApi } from '../api/certificationsApi.js';
import { reportsApi } from '../api/reportsApi.js';
import { usersApi } from '../api/usersApi.js';

// Drives js/pages/genericListPage.js — add a new section here (plus a nav
// entry in js/navConfig.js) to get a routable list page for free.
// Note: 'teachers' and 'subjects' have outgrown this generic table and now
// have their own screens — see pages/{teachers,subjects}Page.js and
// router.js's CUSTOM_PAGES.
export const LIST_PAGES = {
  students: {
    title: 'Students',
    description: 'Manage student records, enrollment, and profiles.',
    api: studentsApi,
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'grade', label: 'Grade' },
      { key: 'status', label: 'Status', isStatus: true },
    ],
  },
  classes: {
    title: 'Classes',
    description: 'Organize classes, sections, and rosters.',
    api: classesApi,
    columns: [
      { key: 'class', label: 'Class' },
      { key: 'homeroomTeacher', label: 'Homeroom Teacher' },
      { key: 'status', label: 'Status', isStatus: true },
    ],
  },
  schedule: {
    title: 'Schedule',
    description: 'Plan and review the weekly class timetable.',
    api: scheduleApi,
    columns: [
      { key: 'time', label: 'Time' },
      { key: 'class', label: 'Class' },
      { key: 'status', label: 'Status', isStatus: true },
    ],
  },
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
