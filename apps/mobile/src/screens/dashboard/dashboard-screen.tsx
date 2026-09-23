import React from 'react';
import { StyleSheet, ScrollView, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth, BottomTabInset } from '@/constants/theme';

import { DashboardCard } from '@/features/dashboard';
import { useDashboardData, type DashboardSummary } from '@/features/dashboard';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function DashboardScreen() {
  const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const { fetchDashboardSummary } = useDashboardData();

  const loadDashboardData = React.useCallback(async () => {
    try {
      const data = await fetchDashboardSummary();
      setSummary(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchDashboardSummary]);

  // Load data on component mount
  React.useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await loadDashboardData();
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [loadDashboardData]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <ThemedText type="title" style={styles.title}>
            Dashboard
          </ThemedText>

          <ThemedText type="default" style={styles.subtitle}>
            Overview of your finances
          </ThemedText>

          <View style={styles.cardsContainer}>
            <DashboardCard
              title="Total Balance"
              value={summary ? formatCurrency(summary.totalBalance) : 'R$ 0.00'}
            />
            <DashboardCard
              title="Income (Month)"
              value={summary ? formatCurrency(summary.monthlyIncome) : 'R$ 0.00'}
            />
            <DashboardCard
              title="Expenses (Month)"
              value={summary ? formatCurrency(summary.monthlyExpenses) : 'R$ 0.00'}
            />
            <DashboardCard
              title="Transactions"
              value={summary ? summary.transactionCount.toString() : '0'}
            />
          </View>

          <ThemedView type="backgroundElement" style={styles.infoCard}>
            <ThemedText type="smallBold">Welcome to your finance app!</ThemedText>
            <ThemedText type="small" style={styles.infoText}>
              This is an example screen showing the base structure of the application.
              Use the created components and hooks as a starting point to develop
              the remaining screens.
            </ThemedText>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  scrollContent: {
    gap: Spacing.three,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: -Spacing.two,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    justifyContent: 'space-between',
  },
  infoCard: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  infoText: {
    lineHeight: 22,
  },
});
