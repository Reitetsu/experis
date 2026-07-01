import axios from 'axios';

import {getApiBaseUrl} from '../config/apiConfig';

export const httpClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    Accept: 'application/json',
  },
  timeout: 10000,
});
