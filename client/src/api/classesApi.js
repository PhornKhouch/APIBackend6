import { createResourceApi } from './resourceFactory.js';
import { classesMock } from '../../data/mock.js';

export const classesApi = createResourceApi('classes', '/api/classes', classesMock);
