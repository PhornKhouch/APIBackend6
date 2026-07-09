import { createResourceApi } from './resourceFactory.js';
import { studentsMock } from '../../data/mock.js';

export const studentsApi = createResourceApi('students', '/api/students', studentsMock);
