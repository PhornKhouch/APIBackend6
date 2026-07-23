import { http } from './httpClient.js';
import { CONFIG } from '../config.js';

// node-api routes at /api/v1/payment (src/routes/paymentRoute.js) wrap responses
// as { message, data }. Recording or updating a payment re-derives the parent
// invoice's amount_paid + status server-side. Payments are never deleted —
// corrections are made by recording a new payment.
const ENDPOINT = '/api/v1/payment';

const useMocks = () => CONFIG.USE_MOCKS.billing;

export const paymentsApi = {
  async list(invoiceId) {
    if (useMocks()) return [];
    const query = invoiceId != null ? `?invoice_id=${invoiceId}` : '';
    const res = await http.get(`${ENDPOINT}${query}`);
    return res.data;
  },
  async getOne(id) {
    if (useMocks()) return null;
    const res = await http.get(`${ENDPOINT}/${id}`);
    return res.data;
  },
  async create(payload) {
    if (useMocks()) return { payment_id: Date.now(), ...payload };
    const res = await http.post(ENDPOINT, payload);
    return res.data;
  },
  async update(id, payload) {
    if (useMocks()) return { payment_id: id, ...payload };
    const res = await http.put(`${ENDPOINT}/${id}`, payload);
    return res.data;
  },
};
