import { http } from './httpClient.js';
import { CONFIG } from '../config.js';
import { dashboardMock } from '../../data/mock.js';

export async function getDashboardOverview() {
  if (CONFIG.USE_MOCKS.dashboard) return dashboardMock;
  return http.get('/api/dashboard/overview');
}
