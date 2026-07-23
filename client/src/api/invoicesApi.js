import { http } from './httpClient.js';
import { CONFIG } from '../config.js';

// node-api routes at /api/v1/invoice (src/routes/invoiceRoute.js) wrap responses
// as { message, data }; unwrap `data` for real calls. Each invoice comes back
// with its nested `Student`, `FeeStructure` (incl. its `Class`), `Semester` and
// `Payments`. Invoices are never deleted — void by updating status instead.
const ENDPOINT = '/api/v1/invoice';

const useMocks = () => CONFIG.USE_MOCKS.billing;

export const invoicesApi = {
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
    if (useMocks()) return { invoice_id: Date.now(), ...payload };
    const res = await http.post(ENDPOINT, payload);
    return res.data;
  },
  async update(id, payload) {
    if (useMocks()) return { invoice_id: id, ...payload };
    const res = await http.put(`${ENDPOINT}/${id}`, payload);
    return res.data;
  },
};
