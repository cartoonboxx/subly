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
    category?: Category;
  }

  interface Category {
    id: number;
    name: string;
  }
}
