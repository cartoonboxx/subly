import {defineStore} from "pinia";

const calendarMonths = [
  {dateName: "января"},
  {dateName: "февраля"},
  {dateName: "марта"},
  {dateName: "апреля"},
  {dateName: "мая"},
  {dateName: "июня"},
  {dateName: "июля"},
  {dateName: "августа"},
  {dateName: "сентября"},
  {dateName: "октября"},
  {dateName: "ноября"},
  {dateName: "декабря"}
];

type ParsedSubscriptionDate = {
  day: number;
  monthIndex: number;
};

type PeriodStep =
  | {
      amount: number;
      unit: "days";
    }
  | {
      amount: number;
      unit: "months";
    };

const parseSubscriptionDate = (date: string): ParsedSubscriptionDate | null => {
  const normalizedDate = date.trim().toLowerCase();
  const dateParts = normalizedDate.match(/^(\d{1,2})\s+(.+)$/);

  if (!dateParts) {
    return null;
  }

  const day = Number(dateParts[1]);
  const monthIndex = calendarMonths.findIndex((month) => {
    return month.dateName === dateParts[2];
  });

  if (!Number.isInteger(day) || day < 1 || day > 31 || monthIndex === -1) {
    return null;
  }

  return {
    day,
    monthIndex
  };
};

const getDaysInMonth = (year: number, monthIndex: number) => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

const toDateOnly = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const parseIsoDate = (date: string) => {
  const dateParts = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!dateParts) {
    return null;
  }

  const year = Number(dateParts[1]);
  const monthIndex = Number(dateParts[2]) - 1;
  const day = Number(dateParts[3]);
  const parsedDate = new Date(year, monthIndex, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== monthIndex ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
};

const formatIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatSubscriptionDate = (date: Date) => {
  return `${date.getDate()} ${calendarMonths[date.getMonth()].dateName}`;
};

const getPeriodStep = (period: string): PeriodStep => {
  if (period === "неделя") {
    return {
      amount: 7,
      unit: "days"
    };
  }

  if (period === "3 месяца") {
    return {
      amount: 3,
      unit: "months"
    };
  }

  if (period === "6 месяцев") {
    return {
      amount: 6,
      unit: "months"
    };
  }

  if (period === "год") {
    return {
      amount: 12,
      unit: "months"
    };
  }

  return {
    amount: 1,
    unit: "months"
  };
};

const addPeriod = (date: Date, step: PeriodStep, sourceDay: number) => {
  if (step.unit === "days") {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + step.amount);

    return nextDate;
  }

  const nextMonthIndex = date.getMonth() + step.amount;
  const nextYear = date.getFullYear() + Math.floor(nextMonthIndex / 12);
  const normalizedNextMonthIndex = nextMonthIndex % 12;

  return new Date(
    nextYear,
    normalizedNextMonthIndex,
    Math.min(sourceDay, getDaysInMonth(nextYear, normalizedNextMonthIndex))
  );
};

const getRegistrationDate = (subscription: Subscription) => {
  const registeredAt = parseIsoDate(subscription.registeredAt);

  if (registeredAt) {
    return registeredAt;
  }

  const parsedDate = parseSubscriptionDate(subscription.date);
  const today = new Date();

  if (!parsedDate) {
    return today;
  }

  return new Date(today.getFullYear(), parsedDate.monthIndex, parsedDate.day);
};

const getInitialSubscriptionDate = (subscription: CreateSubscriptionInput) => {
  const registeredAt = parseIsoDate(subscription.registeredAt);

  return formatSubscriptionDate(registeredAt ?? new Date());
};

const buildTransactions = (
  subscription: Subscription,
  currentDate = new Date()
) => {
  const registrationDate = toDateOnly(getRegistrationDate(subscription));
  const today = toDateOnly(currentDate);
  const step = getPeriodStep(subscription.period);
  const sourceDay = registrationDate.getDate();
  const transactions: Transactions[] = [];
  let transactionDate = registrationDate;
  let transactionId = 1;

  while (transactionDate <= today) {
    transactions.push({
      id: transactionId,
      date: formatIsoDate(transactionDate)
    });

    transactionDate = addPeriod(transactionDate, step, sourceDay);
    transactionId += 1;
  }

  return transactions;
};

const getNormalizedPaymentDate = (
  subscription: Subscription,
  currentDate = new Date()
) => {
  const today = toDateOnly(currentDate);
  const registrationDate = toDateOnly(getRegistrationDate(subscription));
  const step = getPeriodStep(subscription.period);
  const sourceDay = registrationDate.getDate();
  let paymentDate = registrationDate;

  while (paymentDate < today) {
    paymentDate = addPeriod(paymentDate, step, sourceDay);
  }

  return paymentDate;
};

const syncSubscriptionBilling = (
  subscription: Subscription,
  currentDate = new Date()
) => {
  const transactions = buildTransactions(subscription, currentDate);

  if (!subscription.isActive) {
    return {
      ...subscription,
      transactions
    };
  }

  const normalizedPaymentDate = getNormalizedPaymentDate(
    subscription,
    currentDate
  );

  return {
    ...subscription,
    date: formatSubscriptionDate(normalizedPaymentDate),
    transactions
  };
};

export const subscriptionStore = defineStore("subscriptions", {
  state: () => ({
    // subscriptions: [
    //   {
    //     id: 0,
    //     colorClass: "green",
    //     icon: playCircleOutline,
    //     name: "YouTube Premium",
    //     period: "месяц",
    //     isActive: true,
    //     registeredAt: "2026-09-02",
    //     reminderDays: 3,
    //     price: 399,
    //     transactions: [],
    //     category: {
    //       id: 1,
    //       name: "Видео"
    //     }
    //   },
    //   {
    //     id: 1,
    //     colorClass: "green",
    //     icon: playCircleOutline,
    //     name: "YouTube Premium",
    //     period: "месяц",
    //     isActive: true,
    //     registeredAt: "2026-09-19",
    //     reminderDays: 3,
    //     price: 399,
    //     transactions: [],
    //     category: {
    //       id: 1,
    //       name: "Видео"
    //     }
    //   },
    //   {
    //     id: 2,
    //     colorClass: "blue",
    //     icon: radioOutline,
    //     name: "Яндекс Плюс",
    //     period: "месяц",
    //     isActive: true,
    //     registeredAt: "2026-09-22",
    //     reminderDays: 2,
    //     price: 299,
    //     transactions: [],
    //     category: {
    //       id: 2,
    //       name: "Музыка"
    //     }
    //   },
    //   {
    //     id: 3,
    //     colorClass: "violet",
    //     icon: cloudOutline,
    //     name: "iCloud+",
    //     period: "месяц",
    //     isActive: true,
    //     registeredAt: "2026-09-28",
    //     reminderDays: 5,
    //     price: 149,
    //     transactions: [],
    //     category: {
    //       id: 3,
    //       name: "Облако"
    //     }
    //   },
    //   {
    //     id: 4,
    //     colorClass: "orange",
    //     icon: musicalNotesOutline,
    //     name: "Spotify",
    //     period: "месяц",
    //     isActive: true,
    //     registeredAt: "2026-10-03",
    //     reminderDays: 3,
    //     price: 219,
    //     transactions: [],
    //     category: {
    //       id: 2,
    //       name: "Музыка"
    //     }
    //   },
    //   {
    //     id: 5,
    //     colorClass: "red",
    //     icon: cardOutline,
    //     name: "Netflix",
    //     period: "месяц",
    //     isActive: true,
    //     registeredAt: "2026-10-07",
    //     reminderDays: 7,
    //     price: 899,
    //     transactions: [],
    //     category: {
    //       id: 1,
    //       name: "Видео"
    //     }
    //   },
    //   {
    //     id: 6,
    //     colorClass: "cyan",
    //     icon: logoFigma,
    //     name: "Figma Professional",
    //     period: "месяц",
    //     isActive: true,
    //     registeredAt: "2026-10-12",
    //     reminderDays: 5,
    //     price: 990,
    //     transactions: [],
    //     category: {
    //       id: 4,
    //       name: "Работа"
    //     }
    //   }
    // ] as Subscription[],
    subscriptions: [] as Subscription[],
    categories: [
      {
        id: 1,
        name: "Видео"
      },
      {
        id: 2,
        name: "Музыка"
      },
      {
        id: 3,
        name: "Облако"
      },
      {
        id: 4,
        name: "Работа"
      }
    ]
  }),
  getters: {
    getSubscriptions: (state) => state.subscriptions
  },
  actions: {
    addSubscription(subscription: CreateSubscriptionInput) {
      // в будущем убрать, так как будет локальная база данных, где будет это создаваться
      const nextId =
        Math.max(...this.subscriptions.map((item) => item.id), 0) + 1;

      const createdSubscription: Subscription = {
        ...subscription,
        date: subscription.date ?? getInitialSubscriptionDate(subscription),
        id: nextId,
        transactions: subscription.transactions ?? []
      };

      this.subscriptions.push(createdSubscription);

      this.normalizeExpiredSubscriptions();
    },
    updateSubscription(id: number, subscription: UpdateSubscriptionInput) {
      const subscriptionIndex = this.subscriptions.findIndex((item) => {
        return item.id === id;
      });

      if (subscriptionIndex === -1) {
        return;
      }

      this.subscriptions[subscriptionIndex] = {
        ...this.subscriptions[subscriptionIndex],
        ...subscription
      };

      this.normalizeExpiredSubscriptions();
    },
    normalizeExpiredSubscriptions(currentDate = new Date()) {
      this.subscriptions = this.subscriptions.map((subscription) => {
        return syncSubscriptionBilling(subscription, currentDate);
      });
    },
    sumSubscriptions() {
      return this.subscriptions
        .map((item) => item.price)
        .reduce((accumulator, currentValue) => {
          return accumulator + currentValue;
        }, 0);
    }
  }
});
