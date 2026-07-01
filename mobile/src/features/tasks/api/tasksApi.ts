import {getApiBaseUrl} from '../../../config/apiConfig';
import type {TaskDto, TaskFilter} from '../models/task';

export async function getTasks(
  filter: TaskFilter,
  signal?: AbortSignal,
): Promise<ReadonlyArray<TaskDto>> {
  const searchParams = new URLSearchParams();

  if (filter.status) {
    searchParams.set('status', filter.status);
  }

  if (filter.priority) {
    searchParams.set('priority', filter.priority);
  }

  const query = searchParams.toString();
  const url = `${getApiBaseUrl()}/api/tasks${query ? `?${query}` : ''}`;
  return await requestJson<ReadonlyArray<TaskDto>>(url, signal);
}

export async function getTaskById(
  taskId: number,
  signal?: AbortSignal,
): Promise<TaskDto> {
  return await requestJson<TaskDto>(
    `${getApiBaseUrl()}/api/tasks/${taskId}`,
    signal,
  );
}

async function requestJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
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
