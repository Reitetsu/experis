import React, {startTransition, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  getTaskById,
  getTasks,
  type TaskFilter,
} from './src/services/tasksApi';
import {
  formatApiTarget,
  formatCreatedAt,
  formatPriorityLabel,
  formatStatusLabel,
} from './src/utils/formatters';
import type {
  TaskDto,
  TaskPriority,
  TaskStatus,
} from './src/types/tasks';

const STATUS_OPTIONS: ReadonlyArray<TaskStatus> = [
  'Pending',
  'InProgress',
  'Completed',
];

const PRIORITY_OPTIONS: ReadonlyArray<TaskPriority> = ['Low', 'Medium', 'High'];

function App() {
  return (
    <SafeAreaProvider>
      <TaskBoardScreen />
    </SafeAreaProvider>
  );
}

function TaskBoardScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const [filters, setFilters] = useState<TaskFilter>({});
  const [tasks, setTasks] = useState<ReadonlyArray<TaskDto>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailErrorMessage, setDetailErrorMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let isActive = true;

    const loadTasks = async () => {
      try {
        setErrorMessage(null);
        const nextTasks = await getTasks(filters);
        if (!isActive) {
          return;
        }

        setTasks(nextTasks);
        setErrorMessage(null);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(getErrorMessage(error));
      } finally {
        if (!isActive) {
          return;
        }

        setIsLoading(false);
        setIsRefreshing(false);
      }
    };

    loadTasks();

    return () => {
      isActive = false;
    };
  }, [filters, reloadKey]);

  const refreshTasks = () => {
    setIsRefreshing(true);
    setReloadKey(current => current + 1);
  };

  const openTaskDetails = async (task: TaskDto) => {
    setSelectedTask(task);
    setIsDetailVisible(true);
    setIsDetailLoading(true);
    setDetailErrorMessage(null);

    try {
      const fullTask = await getTaskById(task.id);
      setSelectedTask(fullTask);
    } catch (error) {
      setDetailErrorMessage(getErrorMessage(error));
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeTaskDetails = () => {
    setIsDetailVisible(false);
    setDetailErrorMessage(null);
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
    <View style={[styles.header, {paddingTop: safeAreaInsets.top + 12}]}>
      <View style={styles.headerPanel}>
        <Text style={styles.eyebrow}>Reto de gestion de tareas</Text>
        <Text style={styles.title}>Tablero movil de tareas</Text>
        <Text style={styles.subtitle}>
          Lista, filtros y detalle consumiendo la API REST del backend.
        </Text>

        <View style={styles.environmentBadge}>
          <Text style={styles.environmentText}>
            API local: {formatApiTarget()}
          </Text>
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
        <View>
          <Text style={styles.summaryLabel}>Resultados</Text>
          <Text style={styles.summaryValue}>{tasks.length} tareas</Text>
        </View>
        <Pressable onPress={refreshTasks} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>Actualizar</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={tasks}
        keyExtractor={item => `${item.id}`}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            isLoading={isLoading}
            errorMessage={errorMessage}
            onRetry={refreshTasks}
          />
        }
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshTasks}
            tintColor="#114b5f"
          />
        }
        renderItem={({item}) => (
          <TaskCard
            item={item}
            onPress={() => {
              openTaskDetails(item);
            }}
          />
        )}
      />

      <Modal
        animationType="slide"
        transparent
        visible={isDetailVisible}
        onRequestClose={closeTaskDetails}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalEyebrow}>Detalle de tarea</Text>
              <Pressable onPress={closeTaskDetails} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </Pressable>
            </View>

            {selectedTask ? (
              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>{selectedTask.title}</Text>

                <View style={styles.tagRow}>
                  <MetaTag
                    label={formatStatusLabel(selectedTask.status)}
                    tone="dark"
                  />
                  <MetaTag
                    label={formatPriorityLabel(selectedTask.priority)}
                    tone="light"
                  />
                  <MetaTag
                    label={formatCreatedAt(selectedTask.createdAt)}
                    tone="neutral"
                  />
                </View>

                {isDetailLoading ? (
                  <View style={styles.detailLoadingRow}>
                    <ActivityIndicator color="#114b5f" />
                    <Text style={styles.detailLoadingText}>
                      Actualizando detalle desde la API...
                    </Text>
                  </View>
                ) : null}

                {detailErrorMessage ? (
                  <View style={styles.detailErrorCard}>
                    <Text style={styles.detailErrorTitle}>
                      No fue posible refrescar el detalle.
                    </Text>
                    <Text style={styles.detailErrorText}>
                      {detailErrorMessage}
                    </Text>
                  </View>
                ) : null}

                <Text style={styles.descriptionText}>
                  {selectedTask.description}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
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
          label="Todos"
          isSelected={selectedValue === undefined}
          onPress={() => onSelect(undefined)}
        />
        {options.map(option => (
          <FilterChip
            key={option}
            label={formatter(option)}
            isSelected={selectedValue === option}
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

function TaskCard({
  item,
  onPress,
}: {
  item: TaskDto;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardId}>#{item.id}</Text>
      </View>

      <Text numberOfLines={3} style={styles.cardDescription}>
        {item.description}
      </Text>

      <View style={styles.tagRow}>
        <MetaTag label={formatStatusLabel(item.status)} tone="dark" />
        <MetaTag label={formatPriorityLabel(item.priority)} tone="light" />
      </View>

      <Text style={styles.cardFooter}>
        Creada el {formatCreatedAt(item.createdAt)}
      </Text>
    </Pressable>
  );
}

function MetaTag({
  label,
  tone,
}: {
  label: string;
  tone: 'dark' | 'light' | 'neutral';
}) {
  return (
    <View
      style={[
        styles.metaTag,
        tone === 'dark' && styles.metaTagDark,
        tone === 'light' && styles.metaTagLight,
        tone === 'neutral' && styles.metaTagNeutral,
      ]}>
      <Text
        style={[
          styles.metaTagText,
          tone === 'light' && styles.metaTagTextDark,
          tone === 'neutral' && styles.metaTagTextDark,
        ]}>
        {label}
      </Text>
    </View>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrio un error inesperado al consultar la API.';
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
    paddingBottom: 24,
    backgroundColor: '#114b5f',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 16,
  },
  headerPanel: {
    gap: 8,
  },
  eyebrow: {
    color: '#d4f1f4',
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '800',
  },
  subtitle: {
    color: '#dce8eb',
    fontSize: 15,
    lineHeight: 22,
  },
  environmentBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0b3140',
    borderRadius: 999,
  },
  environmentText: {
    color: '#edf7f6',
    fontSize: 12,
    fontWeight: '600',
  },
  filtersSection: {
    marginTop: 24,
    gap: 16,
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
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#c0d7df',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontWeight: '700',
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  refreshButton: {
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  card: {
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 18,
    borderRadius: 24,
    backgroundColor: '#fffdf7',
    borderWidth: 1,
    borderColor: '#e8decc',
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    color: '#14232a',
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '800',
  },
  cardId: {
    color: '#62757b',
    fontSize: 13,
    fontWeight: '700',
  },
  cardDescription: {
    color: '#425258',
    fontSize: 15,
    lineHeight: 22,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaTag: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  metaTagDark: {
    backgroundColor: '#114b5f',
  },
  metaTagLight: {
    backgroundColor: '#f7b32b',
  },
  metaTagNeutral: {
    backgroundColor: '#dce8eb',
  },
  metaTagText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  metaTagTextDark: {
    color: '#18252a',
  },
  cardFooter: {
    color: '#66787e',
    fontSize: 13,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(12, 18, 22, 0.42)',
  },
  modalSheet: {
    minHeight: '48%',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#fffdf8',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#cfd9dc',
    marginBottom: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  modalEyebrow: {
    color: '#64767c',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  closeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#114b5f',
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  modalBody: {
    marginTop: 18,
    gap: 16,
  },
  modalTitle: {
    color: '#15242b',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
  },
  detailLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLoadingText: {
    color: '#4d6168',
    fontSize: 14,
    fontWeight: '600',
  },
  detailErrorCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#fff1eb',
    borderWidth: 1,
    borderColor: '#f0bfaa',
    gap: 4,
  },
  detailErrorTitle: {
    color: '#7d2d14',
    fontSize: 14,
    fontWeight: '800',
  },
  detailErrorText: {
    color: '#8d4b34',
    fontSize: 14,
    lineHeight: 20,
  },
  descriptionText: {
    color: '#24343b',
    fontSize: 16,
    lineHeight: 24,
  },
});

export default App;
