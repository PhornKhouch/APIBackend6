// Local fixture data, shaped like the real API responses will be.
// Each export corresponds to a resource in js/api/*.js — once a backend
// route exists, flip CONFIG.USE_MOCKS[resource] to false and delete the
// matching block here whenever convenient.

export const dashboardMock = {
  stats: {
    totalStudents: { value: 14, trend: 3.4, direction: 'up', label: 'vs last term' },
    teachers: { value: 6, trend: 4, direction: 'up', label: 'this year', isCount: true },
    attendanceToday: { value: 94.2, trend: -0.8, direction: 'down', label: 'vs avg', suffix: '%' },
    outstandingFees: { value: 8450, trend: -6.1, direction: 'down', label: 'vs last month', prefix: '$' },
  },
  enrollmentByMonth: [
    { label: 'Sep', enrolled: 55, attendance: 88 },
    { label: 'Oct', enrolled: 60, attendance: 90 },
    { label: 'Nov', enrolled: 62, attendance: 85 },
    { label: 'Dec', enrolled: 66, attendance: 80 },
    { label: 'Jan', enrolled: 70, attendance: 92 },
    { label: 'Feb', enrolled: 72, attendance: 94 },
  ],
  attendanceToday: {
    presentPct: 94.2,
    segments: [
      { name: 'Present', pct: 89, color: 'var(--teal)' },
      { name: 'Late', pct: 5, color: 'var(--yellow)' },
      { name: 'Absent', pct: 4, color: 'var(--red)' },
      { name: 'Excused', pct: 2, color: 'var(--purple)' },
    ],
  },
  recentActivity: [
    { icon: 'personAdd', title: 'Aisha Bello enrolled into Grade 10 · A', time: '18 minutes ago' },
    { icon: 'teachers', title: 'Midterm grades published for 10A Mathematics', time: '1 hour ago' },
    { icon: 'billing', title: 'Payment $625 recorded for Billy Chen (ABA)', time: '3 hours ago' },
  ],
  needsAttention: [
    { color: 'var(--red)', title: '2 overdue invoices', sub: 'Tuition past due date' },
    { color: 'var(--yellow)', title: '2 inactive students', sub: 'Status needs review' },
  ],
};

export const studentsMock = [
  { name: 'Aisha Bello', grade: '10 · A', status: 'Active' },
  { name: 'Billy Chen', grade: '9 · B', status: 'Active' },
  { name: 'Carla Nguyen', grade: '11 · A', status: 'Pending' },
  { name: 'Daniel Osei', grade: '10 · C', status: 'Inactive' },
];

// Shaped like node-api's teacher endpoints (src/controller/teacherController.js):
// { teacher_id, first_name, last_name, ..., User: { username, email } }.
export const teachersMock = [
  {
    teacher_id: 1,
    first_name: 'Maria',
    last_name: 'Santos',
    gender: 'Female',
    specialization: 'Mathematics',
    contact_number: '012 345 678',
    status: 'Active',
    User: { username: 'msantos', email: 'maria.santos@example.com' },
  },
  {
    teacher_id: 2,
    first_name: 'James',
    last_name: 'Okafor',
    gender: 'Male',
    specialization: 'Physics',
    contact_number: '098 765 432',
    status: 'Active',
    User: { username: 'jokafor', email: 'james.okafor@example.com' },
  },
  {
    teacher_id: 3,
    first_name: 'Linda',
    last_name: 'Park',
    gender: 'Female',
    specialization: 'English',
    contact_number: '011 222 333',
    status: 'Active',
    User: { username: 'lpark', email: 'linda.park@example.com' },
  },
];

export const classesMock = [
  { class: 'Grade 10 · A', homeroomTeacher: 'Maria Santos', status: 'Active' },
  { class: 'Grade 9 · B', homeroomTeacher: 'James Okafor', status: 'Active' },
];

export const subjectsMock = [
  { subject: 'Mathematics', department: 'STEM', status: 'Active' },
  { subject: 'English', department: 'Humanities', status: 'Active' },
];

export const scheduleMock = [
  { time: '08:00 - 09:00', class: 'Grade 10 · A Mathematics', status: 'Scheduled' },
  { time: '09:00 - 10:00', class: 'Grade 9 · B Physics', status: 'Scheduled' },
];

export const attendanceMock = [
  { student: 'Aisha Bello', class: 'Grade 10 · A', status: 'Present' },
  { student: 'Billy Chen', class: 'Grade 9 · B', status: 'Absent' },
];

export const billingMock = [
  { student: 'Billy Chen', invoice: '$625.00', status: 'Paid' },
  { student: 'Carla Nguyen', invoice: '$450.00', status: 'Overdue' },
];

export const certificationsMock = [
  { name: 'Maria Santos', certification: 'Advanced Pedagogy', status: 'Valid' },
  { name: 'James Okafor', certification: 'Lab Safety', status: 'Expiring' },
];

export const reportsMock = [
  { report: 'Term Performance Summary', period: 'Semester 1', status: 'Ready' },
  { report: 'Attendance Compliance', period: 'February', status: 'Processing' },
];

export const usersMock = [
  { name: 'Rosa Guerrero', role: 'Administrator', status: 'Active' },
  { name: 'Maria Santos', role: 'Teacher', status: 'Active' },
];
