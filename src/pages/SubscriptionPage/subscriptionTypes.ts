export type SubscriptionMonthGroup = {
  name: string;
  order: number;
  subscriptions: Subscription[];
};

export type SubscriptionFilters = {
  category: string;
  min: number | null;
  max: number | null;
};

export type StatusFilter = "active" | "inactive" | "all";
