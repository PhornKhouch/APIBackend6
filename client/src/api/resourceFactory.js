import { http } from './httpClient.js';
import { CONFIG } from '../config.js';

// Builds a standard list/create/update/remove API for one resource.
// While CONFIG.USE_MOCKS[mockKey] is true, calls resolve to the local
// fixture instead of hitting the backend — flip the flag once the
// matching node-api route exists.
export function createResourceApi(mockKey, endpointPath, mockRows) {
  const useMocks = () => CONFIG.USE_MOCKS[mockKey];

  return {
    async list() {
      if (useMocks()) return mockRows;
      return http.get(endpointPath);
    },
    async create(payload) {
      if (useMocks()) return { id: Date.now(), ...payload };
      return http.post(endpointPath, payload);
    },
    async update(id, payload) {
      if (useMocks()) return { id, ...payload };
      return http.put(`${endpointPath}/${id}`, payload);
    },
    async remove(id) {
      if (useMocks()) return { success: true };
      return http.del(`${endpointPath}/${id}`);
    },
  };
}
