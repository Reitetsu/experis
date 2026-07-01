import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import type {TaskStatus} from '../models/task';
import {formatStatusLabel} from '../../../utils/formatters';

export function StatusBadge({status}: {status: TaskStatus}) {
  return (
    <View style={[styles.badge, styles.darkBadge]}>
      <Text style={styles.badgeText}>{formatStatusLabel(status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  darkBadge: {
    backgroundColor: '#114b5f',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});
