import axios, {AxiosError, CanceledError} from 'axios';

import {httpClient} from '../src/api/httpClient';
import {getTaskById, getTasks} from '../src/features/tasks/api/tasksApi';
import type {TaskDto} from '../src/features/tasks/models/task';

jest.mock('../src/api/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

const mockedHttpClient = jest.mocked(httpClient);

describe('tasksApi', () => {
  beforeEach(() => {
    mockedHttpClient.get.mockReset();
  });

  test('envia filtros opcionales al listar tareas', async () => {
    const signal = new AbortController().signal;
    const tasks: ReadonlyArray<TaskDto> = [
      {
        id: 1,
        title: 'Revisar lista de incorporacion',
        description: 'Detalle',
        priority: 'Low',
        status: 'Pending',
        createdAt: '2026-06-01T08:00:00',
      },
    ];

    mockedHttpClient.get.mockResolvedValue({data: tasks});

    await expect(
      getTasks({status: 'Pending', priority: 'Low'}, signal),
    ).resolves.toEqual(tasks);

    expect(mockedHttpClient.get).toHaveBeenCalledWith('/api/tasks', {
      params: {
        priority: 'Low',
        status: 'Pending',
      },
      signal,
    });
  });

  test('consulta el detalle por taskId', async () => {
    const task: TaskDto = {
      id: 7,
      title: 'Archivar ticket',
      description: 'Detalle',
      priority: 'Low',
      status: 'Completed',
      createdAt: '2026-06-07T08:00:00',
    };

    mockedHttpClient.get.mockResolvedValue({data: task});

    await expect(getTaskById(7)).resolves.toEqual(task);
    expect(mockedHttpClient.get).toHaveBeenCalledWith('/api/tasks/7', {
      signal: undefined,
    });
  });

  test('interpreta ProblemDetails de validacion', async () => {
    mockedHttpClient.get.mockRejectedValue(
      createAxiosError({
        data: {
          errors: {
            status: ['El estado enviado no es valido.'],
          },
        },
        status: 400,
      }),
    );

    await expect(getTasks({status: 'Pending'})).rejects.toMatchObject({
      message: 'El estado enviado no es valido.',
    });
  });

  test('distingue timeout y error de red', async () => {
    mockedHttpClient.get
      .mockRejectedValueOnce(createAxiosError({code: 'ECONNABORTED'}))
      .mockRejectedValueOnce(createAxiosError());

    await expect(getTasks({})).rejects.toMatchObject({
      message: 'La solicitud a la API excedio el tiempo de espera.',
    });

    await expect(getTasks({})).rejects.toMatchObject({
      message: 'No fue posible conectar con la API.',
    });
  });

  test('preserva la cancelacion como AbortError', async () => {
    mockedHttpClient.get.mockRejectedValue(new CanceledError('cancelada'));

    await expect(getTasks({})).rejects.toMatchObject({
      message: 'La solicitud fue cancelada.',
      name: 'AbortError',
    });
  });
});

function createAxiosError({
  code,
  data,
  status,
}: {
  code?: string;
  data?: {
    detail?: string;
    errors?: Record<string, string[]>;
    title?: string;
  };
  status?: number;
} = {}): AxiosError {
  return {
    code,
    config: {
      headers: axios.AxiosHeaders.from({Accept: 'application/json'}),
    },
    isAxiosError: true,
    message: 'Axios error',
    name: 'AxiosError',
    response: status
      ? {
          config: {
            headers: axios.AxiosHeaders.from({Accept: 'application/json'}),
          },
          data,
          headers: axios.AxiosHeaders.from({}),
          status,
          statusText: 'Error',
        }
      : undefined,
    toJSON: () => ({}),
  } as AxiosError;
}
