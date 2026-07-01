import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {formatCreatedAt} from '../../../utils/formatters';
import type {TaskStackParamList} from '../../../navigation/TaskStackParamList';
import {getTaskById} from '../api/tasksApi';
import {PriorityBadge} from '../components/PriorityBadge';
import {StatusBadge} from '../components/StatusBadge';
import type {TaskDto} from '../models/task';

type Props = NativeStackScreenProps<TaskStackParamList, 'TaskDetail'>;

export function TaskDetailScreen({route}: Props) {
  const {taskId} = route.params;
  const [task, setTask] = useState<TaskDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadTask = async () => {
      try {
        setErrorMessage(null);
        const nextTask = await getTaskById(taskId, controller.signal);
        setTask(nextTask);
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }

        setErrorMessage(getErrorMessage(error));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    setIsLoading(true);
    loadTask();

    return () => {
      controller.abort();
    };
  }, [reloadKey, taskId]);

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator color="#114b5f" size="large" />
        <Text style={styles.stateTitle}>Cargando detalle</Text>
        <Text style={styles.stateText}>
          Consultando la API para obtener la informacion completa de la tarea.
        </Text>
      </View>
    );
  }

  if (errorMessage || !task) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.stateTitle}>No se pudo cargar la tarea</Text>
        <Text style={styles.stateText}>
          {errorMessage ?? 'La tarea solicitada no esta disponible.'}
        </Text>
        <Pressable
          onPress={() => setReloadKey(current => current + 1)}
          style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      style={styles.screen}>
      <View style={styles.heroCard}>
        <Text style={styles.taskId}>Tarea #{task.id}</Text>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.description}>{task.description}</Text>

        <View style={styles.tagRow}>
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </View>
      </View>

      <View style={styles.metaCard}>
        <Text style={styles.metaHeading}>Resumen</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Estado</Text>
          <StatusBadge status={task.status} />
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Prioridad</Text>
          <PriorityBadge priority={task.priority} />
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Creada</Text>
          <Text style={styles.metaValue}>{formatCreatedAt(task.createdAt)}</Text>
        </View>
      </View>
    </ScrollView>
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
    padding: 20,
    gap: 16,
  },
  centeredState: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f4f1ea',
  },
  stateTitle: {
    color: '#15242b',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  stateText: {
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
  heroCard: {
    padding: 22,
    borderRadius: 28,
    backgroundColor: '#114b5f',
    gap: 14,
  },
  taskId: {
    color: '#d4f1f4',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
  },
  description: {
    color: '#dce8eb',
    fontSize: 16,
    lineHeight: 24,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#fffdf7',
    borderWidth: 1,
    borderColor: '#e8decc',
    gap: 16,
  },
  metaHeading: {
    color: '#15242b',
    fontSize: 20,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  metaLabel: {
    color: '#4d6168',
    fontSize: 14,
    fontWeight: '700',
  },
  metaValue: {
    color: '#15242b',
    fontSize: 14,
    fontWeight: '700',
  },
});
