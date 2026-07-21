import { http } from './httpClient.js';
import { CONFIG } from '../config.js';

// node-api routes at /api/v1/schedule (src/routes/scheduleRoute.js) wrap
// responses as { message, data }; unwrap `data` for real calls. Each schedule
// row comes back with its nested `Class`, `Subject`, `Teacher` and `TimeSlot`
// associations. `list()` accepts an optional { class_id, teacher_id } filter.
const ENDPOINT = '/api/v1/schedule';

const useMocks = () => CONFIG.USE_MOCKS.schedule;

function queryString(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '');
  if (!entries.length) return '';
  return `?${entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
}

export const scheduleApi = {
  async list(params = {}) {
    if (useMocks()) return [];
    const res = await http.get(`${ENDPOINT}${queryString(params)}`);
    return res.data;
  },
  async getOne(id) {
    if (useMocks()) return null;
    const res = await http.get(`${ENDPOINT}/${id}`);
    return res.data;
  },
  async create(payload) {
    if (useMocks()) return { schedule_id: Date.now(), ...payload };
    const res = await http.post(ENDPOINT, payload);
    return res.data;
  },
  async update(id, payload) {
    if (useMocks()) return { schedule_id: id, ...payload };
    const res = await http.put(`${ENDPOINT}/${id}`, payload);
    return res.data;
  },
  async remove(id) {
    if (useMocks()) return { success: true };
    return http.del(`${ENDPOINT}/${id}`);
  },
  // Students assigned to a schedule entry. listStudents returns ScheduleStudent
  // rows, each with a nested `Student`. setStudents replaces the whole set.
  async listStudents(id) {
    if (useMocks()) return [];
    const res = await http.get(`${ENDPOINT}/${id}/students`);
    return res.data;
  },
  async setStudents(id, studentIds) {
    if (useMocks()) return [];
    const res = await http.put(`${ENDPOINT}/${id}/students`, { student_ids: studentIds });
    return res.data;
  },
};
