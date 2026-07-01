import {Platform} from 'react-native';

import type {TaskDto, TaskPriority, TaskStatus} from '../types/tasks';

export type TaskFilter = {
  status?: TaskStatus;
  priority?: TaskPriority;
};

const API_HOST =
  Platform.OS === 'android' ? 'http://10.0.2.2:5080' : 'http://localhost:5080';

export function getApiBaseUrl(): string {
  return API_HOST;
}

export async function getTasks(filter: TaskFilter): Promise<ReadonlyArray<TaskDto>> {
  const searchParams = new URLSearchParams();

  if (filter.status) {
    searchParams.set('status', filter.status);
  }

  if (filter.priority) {
    searchParams.set('priority', filter.priority);
  }

  const query = searchParams.toString();
  const url = `${API_HOST}/api/tasks${query ? `?${query}` : ''}`;
  return await requestJson<ReadonlyArray<TaskDto>>(url);
}

export async function getTaskById(id: number): Promise<TaskDto> {
  return await requestJson<TaskDto>(`${API_HOST}/api/tasks/${id}`);
}

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await buildErrorMessage(response));
  }

  return (await response.json()) as T;
}

async function buildErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      detail?: string;
      errors?: Record<string, string[]>;
      title?: string;
    };

    if (data.errors) {
      const firstMessage = Object.values(data.errors).flat()[0];
      if (firstMessage) {
        return firstMessage;
      }
    }

    if (data.detail) {
      return data.detail;
    }

    if (data.title) {
      return data.title;
    }
  } catch {
    // Ignore parsing problems and fall back to the HTTP status.
  }

  return `La API respondio con estado ${response.status}.`;
}
