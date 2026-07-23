// Central place to point the client at a real backend.
// node-api currently runs on :3000 (see ../node-api/index.js).
export const CONFIG = {
  //API_BASE_URL: 'http://localhost:3000', // localhost 
  API_BASE_URL : 'https://api-sms.up.railway.app',

  // Per-resource switch: true = use local mock data (data/mock.js),
  // false = call the real endpoint via js/api/*.
  // Flip a resource to false once its node-api route exists.
  USE_MOCKS: {
    dashboard: true,
    students: false,
    teachers: false,
    classes: false,
    subjects: false,
    semesters: false,
    schedule: false,
    attendance: true,
    billing: false,
    certifications: true,
    reports: true,
    users: true,
  },
};
