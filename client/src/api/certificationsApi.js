import { createResourceApi } from './resourceFactory.js';
import { certificationsMock } from '../../data/mock.js';

export const certificationsApi = createResourceApi('certifications', '/api/certifications', certificationsMock);
