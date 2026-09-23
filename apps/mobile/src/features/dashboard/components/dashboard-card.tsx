import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export interface DashboardCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
}

export function DashboardCard({ title, value, icon }: DashboardCardProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.cardHeader}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <ThemedText type="small" style={styles.title}>
          {title}
        </ThemedText>
      </View>
      <ThemedText type="subtitle" style={styles.value}>
        {value}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.two,
    flex: 1,
    minWidth: 140,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
  },
  value: {
    marginTop: Spacing.one,
  },
});
