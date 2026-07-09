import { http } from './httpClient.js';
import { CONFIG } from '../config.js';
import { subjectsMock } from '../../data/mock.js';

// node-api routes at /api/v1/subject (src/routes/subjectRoute.js) wrap
// responses as { message, data }; unwrap `data` for real calls.
const ENDPOINT = '/api/v1/subject';

const useMocks = () => CONFIG.USE_MOCKS.subjects;

export const subjectsApi = {
  async list() {
    if (useMocks()) return subjectsMock;
    const res = await http.get(ENDPOINT);
    return res.data;
  },
  async getOne(id) {
    if (useMocks()) return subjectsMock.find((s) => s.subject_id === id);
    const res = await http.get(`${ENDPOINT}/${id}`);
    return res.data;
  },
  async create(payload) {
    if (useMocks()) return { subject_id: Date.now(), ...payload };
    const res = await http.post(ENDPOINT, payload);
    return res.data;
  },
  async update(id, payload) {
    if (useMocks()) return { subject_id: id, ...payload };
    const res = await http.put(`${ENDPOINT}/${id}`, payload);
    return res.data;
  },
  async remove(id) {
    if (useMocks()) return { success: true };
    return http.del(`${ENDPOINT}/${id}`);
  },
};
