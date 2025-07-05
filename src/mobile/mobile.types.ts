// Types for mobile module

export interface MobileDashboard {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  recentTransactions: any[];
  accounts: MobileAccount[];
  quickStats: {
    pendingTransactions: number;
    thisMonthTransactions: number;
    averageTransaction: number;
  };
}

export interface MobileAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  transactionCount: number;
}

export interface MobileTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  date: string;
  status: string;
  accountName?: string;
  category?: string;
  receiptUrl?: string;
}
