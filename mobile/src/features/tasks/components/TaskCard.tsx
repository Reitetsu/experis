import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {formatCreatedAt} from '../../../utils/formatters';
import type {TaskStackParamList} from '../../../navigation/TaskStackParamList';
import type {TaskDto} from '../models/task';
import {PriorityBadge} from './PriorityBadge';
import {StatusBadge} from './StatusBadge';

type TaskListNavigationProp = NativeStackNavigationProp<
  TaskStackParamList,
  'TaskList'
>;

export function TaskCard({task}: {task: TaskDto}) {
  const navigation = useNavigation<TaskListNavigationProp>();

  return (
    <Pressable
      onPress={() => navigation.navigate('TaskDetail', {taskId: task.id})}
      style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{task.title}</Text>
        <Text style={styles.cardId}>#{task.id}</Text>
      </View>

      <Text numberOfLines={3} style={styles.cardDescription}>
        {task.description}
      </Text>

      <View style={styles.tagRow}>
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </View>

      <Text style={styles.cardFooter}>
        Creada el {formatCreatedAt(task.createdAt)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  cardFooter: {
    color: '#66787e',
    fontSize: 13,
    fontWeight: '600',
  },
});
