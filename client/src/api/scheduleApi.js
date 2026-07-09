import { createResourceApi } from './resourceFactory.js';
import { scheduleMock } from '../../data/mock.js';

export const scheduleApi = createResourceApi('schedule', '/api/schedule', scheduleMock);
