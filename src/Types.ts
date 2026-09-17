export {};

declare global {
  interface Subscription {
    id: number;
    name: string;
    colorClass: string;
    icon: string;
    date: string;
    period: string; // неделя, месяц и другие метрики
    price: number;
  }
}
