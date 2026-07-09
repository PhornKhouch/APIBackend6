import { createResourceApi } from './resourceFactory.js';
import { attendanceMock } from '../../data/mock.js';

export const attendanceApi = createResourceApi('attendance', '/api/attendance', attendanceMock);
