import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import type {TaskPriority} from '../models/task';
import {formatPriorityLabel} from '../../../utils/formatters';

export function PriorityBadge({priority}: {priority: TaskPriority}) {
  return (
    <View style={[styles.badge, styles.lightBadge]}>
      <Text style={styles.badgeText}>{formatPriorityLabel(priority)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  lightBadge: {
    backgroundColor: '#f7b32b',
  },
  badgeText: {
    color: '#18252a',
    fontSize: 12,
    fontWeight: '800',
  },
});
