export interface BankConnection {
    id: string;
    tenantId: string;
    bankName: string;
    accountNumber: string;
    connectionType: 'open_banking' | 'scraping' | 'manual';
    isActive: boolean;
    lastSync: Date;
    credentials?: any;
}
export interface BankAccount {
    id: string;
    name: string;
    type: string;
    balance: string;
    currency: string;
    accountNumber: string;
}
export interface BankTransaction {
    id: string;
    amount: string;
    description: string;
    date: Date;
    type: 'debit' | 'credit';
    balance?: string;
    category?: string;
    merchant?: string;
}
