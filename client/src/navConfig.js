// Single source of truth for sidebar nav + routing.
// Add a new section here and it shows up in the sidebar and becomes routable.
export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'setup', label: 'Setup', icon: 'setup' },
  { key: 'students', label: 'Students', icon: 'students' },
  { key: 'teachers', label: 'Teachers', icon: 'teachers' },
  { key: 'classes', label: 'Classes', icon: 'classes' },
  { key: 'subjects', label: 'Subjects', icon: 'subjects' },
  { key: 'schedule', label: 'Schedule', icon: 'schedule' },
  { key: 'attendance', label: 'Attendance', icon: 'attendance' },
  { key: 'billing', label: 'Billing', icon: 'billing', badgeKey: 'billingOverdueCount' },
  { key: 'certifications', label: 'Certifications', icon: 'certifications' },
  { key: 'reports', label: 'Reports', icon: 'reports' },
  { key: 'users', label: 'Users & Roles', icon: 'users' },
];
