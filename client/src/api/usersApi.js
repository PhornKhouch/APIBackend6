import { http } from './httpClient.js';
import { CONFIG } from '../config.js';
import { usersMock } from '../../data/mock.js';

// node-api already implements this one (src/routes/userRoute.js) —
// endpoints below match its actual (non-RESTful) shape.
export const usersApi = {
  async list() {
    if (CONFIG.USE_MOCKS.users) return usersMock;
    return http.get('/api/user');
  },
  async create(payload) {
    if (CONFIG.USE_MOCKS.users) return { id: Date.now(), ...payload };
    return http.post('/api/user', payload);
  },
  async update(id, payload) {
    if (CONFIG.USE_MOCKS.users) return { id, ...payload };
    return http.put('/api/user/update', { id, ...payload });
  },
  async remove(id) {
    if (CONFIG.USE_MOCKS.users) return { success: true };
    return http.del(`/api/user/delete/${id}`);
  },
};
