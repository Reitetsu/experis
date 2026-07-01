import React, {startTransition, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {formatApiTarget, formatPriorityLabel, formatStatusLabel} from '../../../utils/formatters';
import {getTasks} from '../api/tasksApi';
import {TaskCard} from '../components/TaskCard';
import type {TaskDto, TaskFilter, TaskPriority, TaskStatus} from '../models/task';

const STATUS_OPTIONS: ReadonlyArray<TaskStatus> = [
  'Pending',
  'InProgress',
  'Completed',
];

const PRIORITY_OPTIONS: ReadonlyArray<TaskPriority> = ['Low', 'Medium', 'High'];

export function TaskListScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const [filters, setFilters] = useState<TaskFilter>({});
  const [tasks, setTasks] = useState<ReadonlyArray<TaskDto>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadTasks = async () => {
      try {
        setErrorMessage(null);
        const nextTasks = await getTasks(filters, controller.signal);
        setTasks(nextTasks);
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }

        setErrorMessage(getErrorMessage(error));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    loadTasks();

    return () => {
      controller.abort();
    };
  }, [filters, reloadKey]);

  const refreshTasks = () => {
    setIsRefreshing(true);
    setReloadKey(current => current + 1);
  };

  const selectStatus = (status?: TaskStatus) => {
    startTransition(() => {
      setFilters(current => ({
        ...current,
        status,
      }));
    });
  };

  const selectPriority = (priority?: TaskPriority) => {
    startTransition(() => {
      setFilters(current => ({
        ...current,
        priority,
      }));
    });
  };

  const header = (
    <View style={[styles.header, {paddingTop: safeAreaInsets.top + 10}]}>
      <View style={styles.headerPanel}>
        <Text style={styles.eyebrow}>Reto de gestion de tareas</Text>
        <Text style={styles.title}>Tareas</Text>
        <Text style={styles.subtitle}>
          Lista, filtros y detalle conectados con la API del backend.
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.environmentBadge}>
            <Text style={styles.environmentText}>
              API local: {formatApiTarget()}
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{tasks.length} tareas</Text>
          </View>
        </View>
      </View>

      <View style={styles.filtersSection}>
        <FilterGroup<TaskStatus>
          label="Estado"
          options={STATUS_OPTIONS}
          selectedValue={filters.status}
          onSelect={selectStatus}
          formatter={formatStatusLabel}
        />
        <FilterGroup<TaskPriority>
          label="Prioridad"
          options={PRIORITY_OPTIONS}
          selectedValue={filters.priority}
          onSelect={selectPriority}
          formatter={formatPriorityLabel}
        />
      </View>
      <View style={styles.summaryRow}>
        <Pressable onPress={refreshTasks} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>Actualizar</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.contentContainer}
        data={tasks}
        keyExtractor={item => `${item.id}`}
        ListEmptyComponent={
          <EmptyState
            errorMessage={errorMessage}
            isLoading={isLoading}
            onRetry={refreshTasks}
          />
        }
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl
            onRefresh={refreshTasks}
            refreshing={isRefreshing}
            tintColor="#114b5f"
          />
        }
        renderItem={({item}) => <TaskCard task={item} />}
      />
    </View>
  );
}

function FilterGroup<T extends string>({
  formatter,
  label,
  onSelect,
  options,
  selectedValue,
}: {
  formatter: (value: T) => string;
  label: string;
  onSelect: (value?: T) => void;
  options: ReadonlyArray<T>;
  selectedValue?: T;
}) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.filterChipsRow}>
        <FilterChip
          isSelected={selectedValue === undefined}
          label="Todos"
          onPress={() => onSelect(undefined)}
        />
        {options.map(option => (
          <FilterChip
            isSelected={selectedValue === option}
            key={option}
            label={formatter(option)}
            onPress={() => onSelect(option)}
          />
        ))}
      </View>
    </View>
  );
}

function FilterChip({
  isSelected,
  label,
  onPress,
}: {
  isSelected: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.filterChip, isSelected && styles.filterChipSelected]}>
      <Text
        style={[
          styles.filterChipText,
          isSelected && styles.filterChipTextSelected,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

function EmptyState({
  errorMessage,
  isLoading,
  onRetry,
}: {
  errorMessage: string | null;
  isLoading: boolean;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator color="#114b5f" size="large" />
        <Text style={styles.emptyStateTitle}>Cargando tareas</Text>
        <Text style={styles.emptyStateText}>
          Consultando el backend para pintar el tablero inicial.
        </Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateTitle}>No se pudo cargar la lista</Text>
        <Text style={styles.emptyStateText}>{errorMessage}</Text>
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>Sin resultados</Text>
      <Text style={styles.emptyStateText}>
        Prueba otra combinacion de filtros para encontrar tareas.
      </Text>
    </View>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Ocurrio un error inesperado al consultar la API.';
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f1ea',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    backgroundColor: '#114b5f',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 12,
  },
  headerPanel: {
    gap: 6,
  },
  eyebrow: {
    color: '#d4f1f4',
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: '#dce8eb',
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  environmentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#0b3140',
    borderRadius: 999,
  },
  environmentText: {
    color: '#edf7f6',
    fontSize: 12,
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#1b647a',
  },
  countBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  filtersSection: {
    marginTop: 18,
    gap: 14,
  },
  filterGroup: {
    gap: 10,
  },
  filterLabel: {
    color: '#f3f7f8',
    fontSize: 15,
    fontWeight: '700',
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3d7488',
    backgroundColor: '#114b5f',
  },
  filterChipSelected: {
    backgroundColor: '#f7b32b',
    borderColor: '#f7b32b',
  },
  filterChipText: {
    color: '#d6e6eb',
    fontSize: 13,
    fontWeight: '700',
  },
  filterChipTextSelected: {
    color: '#1c1a17',
  },
  summaryRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  refreshButtonText: {
    color: '#114b5f',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyState: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    gap: 10,
  },
  emptyStateTitle: {
    color: '#15242b',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyStateText: {
    color: '#4c5c63',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#114b5f',
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
});
