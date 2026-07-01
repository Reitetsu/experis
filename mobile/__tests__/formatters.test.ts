import {
  formatApiTarget,
  formatCreatedAt,
  formatPriorityLabel,
  formatStatusLabel,
} from '../src/utils/formatters';

describe('formatters', () => {
  test('formatea el destino de la API para el emulador', () => {
    expect(formatApiTarget()).toMatch(/(10\.0\.2\.2|localhost):5080/);
  });

  test('formatea los valores permitidos de la tarea', () => {
    expect(formatStatusLabel('InProgress')).toBe('En progreso');
    expect(formatPriorityLabel('High')).toBe('Alta');
    expect(formatCreatedAt('2026-06-09T08:00:00')).toBe('2026-06-09');
  });

  test('conserva la fecha original cuando el valor es invalido', () => {
    expect(formatCreatedAt('not-a-date')).toBe('not-a-date');
  });
});
