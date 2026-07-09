import { http } from './httpClient.js';
import { CONFIG } from '../config.js';

// node-api routes at /api/v1/semester (src/routes/semesterRoute.js) wrap
// responses as { message, data }; unwrap `data` for real calls. Each semester
// comes back with its nested `AcademicYear` (Semester.belongsTo AcademicYear).
const ENDPOINT = '/api/v1/semester';

const useMocks = () => CONFIG.USE_MOCKS.semesters;

export const semestersApi = {
  async list() {
    if (useMocks()) return [];
    const res = await http.get(ENDPOINT);
    return res.data;
  },
  async getOne(id) {
    if (useMocks()) return null;
    const res = await http.get(`${ENDPOINT}/${id}`);
    return res.data;
  },
  async create(payload) {
    if (useMocks()) return { semester_id: Date.now(), ...payload };
    const res = await http.post(ENDPOINT, payload);
    return res.data;
  },
  async update(id, payload) {
    if (useMocks()) return { semester_id: id, ...payload };
    const res = await http.put(`${ENDPOINT}/${id}`, payload);
    return res.data;
  },
  async remove(id) {
    if (useMocks()) return { success: true };
    return http.del(`${ENDPOINT}/${id}`);
  },
};
