import axios, {AxiosError} from 'axios';

import {httpClient} from '../../../api/httpClient';
import type {TaskDto, TaskFilter} from '../models/task';

type ProblemDetails = {
  detail?: string;
  errors?: Record<string, string[]>;
  title?: string;
};

export async function getTasks(
  filter: TaskFilter,
  signal?: AbortSignal,
): Promise<ReadonlyArray<TaskDto>> {
  const params: Record<string, string> = {};

  if (filter.status) {
    params.status = filter.status;
  }

  if (filter.priority) {
    params.priority = filter.priority;
  }

  return await requestJson<ReadonlyArray<TaskDto>>('/api/tasks', {
    params,
    signal,
  });
}

export async function getTaskById(
  taskId: number,
  signal?: AbortSignal,
): Promise<TaskDto> {
  return await requestJson<TaskDto>(`/api/tasks/${taskId}`, {signal});
}

async function requestJson<T>(
  path: string,
  options: {
    params?: Record<string, string>;
    signal?: AbortSignal;
  },
): Promise<T> {
  try {
    const response = await httpClient.get<T>(path, options);
    return response.data;
  } catch (error) {
    throw buildRequestError(error);
  }
}

function buildRequestError(error: unknown): Error {
  if (
    axios.isCancel(error) ||
    (axios.isAxiosError(error) && error.code === 'ERR_CANCELED')
  ) {
    const abortError = new Error('La solicitud fue cancelada.');
    abortError.name = 'AbortError';
    return abortError;
  }

  if (axios.isAxiosError<ProblemDetails>(error)) {
    return buildAxiosError(error);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('Ocurrio un error inesperado al consultar la API.');
}

function buildAxiosError(error: AxiosError<ProblemDetails>): Error {
  if (error.code === 'ECONNABORTED') {
    return new Error('La solicitud a la API excedio el tiempo de espera.');
  }

  if (!error.response) {
    return new Error('No fue posible conectar con la API.');
  }

  const data = error.response.data;

  if (data?.errors) {
    const firstMessage = Object.values(data.errors).flat()[0];
    if (firstMessage) {
      return new Error(firstMessage);
    }
  }

  if (data?.detail) {
    return new Error(data.detail);
  }

  if (data?.title) {
    return new Error(data.title);
  }

  return new Error(`La API respondio con estado ${error.response.status}.`);
}
