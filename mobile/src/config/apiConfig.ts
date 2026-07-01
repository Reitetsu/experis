import {Platform} from 'react-native';

const API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:5080' : 'http://localhost:5080';

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
