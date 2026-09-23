import { apiClient } from '@/services/api';

export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  transactionCount: number;
}

/**
 * Hook to fetch dashboard data
 * Returns user financial summary
 */
export function useDashboardData() {
  async function fetchDashboardSummary(): Promise<DashboardSummary> {
    try {
      // Fetch transactions from current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const transactions = await apiClient.get<any[]>(
        `/api/v1/transactions/?date_from=${firstDayOfMonth.toISOString()}&date_to=${lastDayOfMonth.toISOString()}&limit=100`
      );

      // Calculate summary
      const summary = transactions.reduce(
        (acc, transaction) => {
          const amount = parseFloat(transaction.amount) || 0;
          const isIncome = transaction.transaction_type?.is_positive ?? false;

          if (isIncome) {
            acc.monthlyIncome += amount;
          } else {
            acc.monthlyExpenses += amount;
          }
          acc.transactionCount += 1;
          return acc;
        },
        { totalBalance: 0, monthlyIncome: 0, monthlyExpenses: 0, transactionCount: 0 }
      );

      // Total balance would be calculated more accurately on the backend
      summary.totalBalance = summary.monthlyIncome - summary.monthlyExpenses;

      return summary;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Return zeroed values in case of error
      return {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        transactionCount: 0,
      };
    }
  }

  return {
    fetchDashboardSummary,
  };
}
