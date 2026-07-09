import { createResourceApi } from './resourceFactory.js';
import { reportsMock } from '../../data/mock.js';

export const reportsApi = createResourceApi('reports', '/api/reports', reportsMock);
