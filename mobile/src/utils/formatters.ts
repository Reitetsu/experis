import {getApiBaseUrl} from '../services/tasksApi';
import type {TaskPriority, TaskStatus} from '../types/tasks';

const STATUS_LABELS: Record<TaskStatus, string> = {
  Pending: 'Pendiente',
  InProgress: 'En progreso',
  Completed: 'Completada',
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  Low: 'Baja',
  Medium: 'Media',
  High: 'Alta',
};

export function formatStatusLabel(status: TaskStatus): string {
  return STATUS_LABELS[status];
}

export function formatPriorityLabel(priority: TaskPriority): string {
  return PRIORITY_LABELS[priority];
}

export function formatCreatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatApiTarget(): string {
  return getApiBaseUrl().replace('http://', '');
}
