import { http } from './httpClient.js';
import { CONFIG } from '../config.js';
import { teachersMock } from '../../data/mock.js';

// node-api routes at /api/v1/teacher (src/routes/teacherRoute.js) wrap
// responses as { message, data }; unwrap `data` for real calls.
const ENDPOINT = '/api/v1/teacher';

const useMocks = () => CONFIG.USE_MOCKS.teachers;

export const teachersApi = {
  async list() {
    if (useMocks()) return teachersMock;
    const res = await http.get(ENDPOINT);
    return res.data;
  },
  async getOne(id) {
    if (useMocks()) return teachersMock.find((t) => t.teacher_id === id);
    const res = await http.get(`${ENDPOINT}/${id}`);
    return res.data;
  },
  async create(payload) {
    if (useMocks()) return { teacher_id: Date.now(), ...payload };
    const res = await http.post(ENDPOINT, payload);
    return res.data;
  },
  async update(id, payload) {
    if (useMocks()) return { teacher_id: id, ...payload };
    const res = await http.put(`${ENDPOINT}/${id}`, payload);
    return res.data;
  },
  async remove(id) {
    if (useMocks()) return { success: true };
    return http.del(`${ENDPOINT}/${id}`);
  },
};
