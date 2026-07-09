import { createResourceApi } from './resourceFactory.js';
import { billingMock } from '../../data/mock.js';

export const billingApi = createResourceApi('billing', '/api/billing', billingMock);
