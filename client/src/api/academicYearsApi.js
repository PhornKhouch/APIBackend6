import { http } from './httpClient.js';

// node-api routes at /api/v1/academic-year (src/routes/academicRoute.js) wrap
// responses as { message, data }; unwrap `data` here.
const ENDPOINT = '/api/v1/academic-year';

export const academicYearsApi = {
  async list() {
    const res = await http.get(ENDPOINT);
    return res.data;
  },
  async getOne(id) {
    const res = await http.get(`${ENDPOINT}/${id}`);
    return res.data;
  },
  async create(payload) {
    const res = await http.post(ENDPOINT, payload);
    return res.data;
  },
  async update(id, payload) {
    const res = await http.put(`${ENDPOINT}/${id}`, payload);
    return res.data;
  },
  async remove(id) {
    return http.del(`${ENDPOINT}/${id}`);
  },
};
