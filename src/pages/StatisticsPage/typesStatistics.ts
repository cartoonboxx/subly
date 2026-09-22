export type CategoryStat = {
  name: string;
  percent: number;
  total: number;
};

export type HistoryMonth = {
  key: string;
  label: string;
  monthIndex: number;
  percent: number;
  total: number;
  year: number;
};

export type RankedSubscription = {
  monthlyTotal: number;
  percent: number;
  subscription: Subscription;
};

export type UpcomingPayment = {
  amount: number;
  colorClass: string;
  dateLabel: string;
  daysLabel: string;
  icon: string;
  id: number;
  name: string;
};
