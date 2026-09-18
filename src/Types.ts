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
    category?: Category;
    transactions: Transactions[];
  }

  type CreateSubscriptionInput = Omit<
    Subscription,
    "id" | "date" | "transactions"
  > & {
    date?: string;
    transactions?: Transactions[];
  };

  type UpdateSubscriptionInput = Partial<CreateSubscriptionInput>;

  interface Category {
    id: number;
    name: string;
  }

  interface Transactions {
    id: number;
    date: string;
  }
}
