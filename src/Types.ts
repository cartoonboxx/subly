export {};

declare global {
  interface Subscription {
    id: number;
    name: string;
    price: number;
    date: string;
    period: string; // неделя, месяц и другие метрики
    colorClass: string;
    icon: string;
    isActive: boolean;
    registeredAt: string;
    reminderDays: number;
    expiresAt?: string | null;
    category?: Category;
    transactions: Transaction[];
  }

  type CreateSubscriptionInput = Omit<
    Subscription,
    "id" | "date" | "transactions"
  > & {
    date?: string;
    transactions?: Transaction[];
  };

  type UpdateSubscriptionInput = Partial<CreateSubscriptionInput>;

  interface Category {
    id: number;
    name: string;
  }

  interface Transaction {
    id: number;
    date: string;
  }
}
