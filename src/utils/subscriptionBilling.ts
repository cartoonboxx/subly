export type CalendarMonth = {
  dateName: string;
  label: string;
  name: string;
  prepositionalName: string;
  shortLabel: string;
};

export type ParsedSubscriptionDate = {
  day: number;
  monthIndex: number;
};

export type PeriodStep =
  | {
      unit: "once";
    }
  | {
      amount: number;
      unit: "days";
    }
  | {
      amount: number;
      unit: "months";
    };

export const calendarMonths: CalendarMonth[] = [
  {
    dateName: "января",
    label: "Январь",
    name: "Январь",
    prepositionalName: "январе",
    shortLabel: "янв"
  },
  {
    dateName: "февраля",
    label: "Февраль",
    name: "Февраль",
    prepositionalName: "феврале",
    shortLabel: "фев"
  },
  {
    dateName: "марта",
    label: "Март",
    name: "Март",
    prepositionalName: "марте",
    shortLabel: "мар"
  },
  {
    dateName: "апреля",
    label: "Апрель",
    name: "Апрель",
    prepositionalName: "апреле",
    shortLabel: "апр"
  },
  {
    dateName: "мая",
    label: "Май",
    name: "Май",
    prepositionalName: "мае",
    shortLabel: "май"
  },
  {
    dateName: "июня",
    label: "Июнь",
    name: "Июнь",
    prepositionalName: "июне",
    shortLabel: "июн"
  },
  {
    dateName: "июля",
    label: "Июль",
    name: "Июль",
    prepositionalName: "июле",
    shortLabel: "июл"
  },
  {
    dateName: "августа",
    label: "Август",
    name: "Август",
    prepositionalName: "августе",
    shortLabel: "авг"
  },
  {
    dateName: "сентября",
    label: "Сентябрь",
    name: "Сентябрь",
    prepositionalName: "сентябре",
    shortLabel: "сен"
  },
  {
    dateName: "октября",
    label: "Октябрь",
    name: "Октябрь",
    prepositionalName: "октябре",
    shortLabel: "окт"
  },
  {
    dateName: "ноября",
    label: "Ноябрь",
    name: "Ноябрь",
    prepositionalName: "ноябре",
    shortLabel: "ноя"
  },
  {
    dateName: "декабря",
    label: "Декабрь",
    name: "Декабрь",
    prepositionalName: "декабре",
    shortLabel: "дек"
  }
];

export const MS_IN_DAY = 24 * 60 * 60 * 1000;

export const parseSubscriptionDate = (
  date: string
): ParsedSubscriptionDate | null => {
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

export const getDaysInMonth = (year: number, monthIndex: number) => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

export const getMonthRange = (date: Date) => {
  return {
    end: toDateOnly(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
    start: toDateOnly(new Date(date.getFullYear(), date.getMonth(), 1))
  };
};

export const toDateOnly = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const parseIsoDate = (date: string) => {
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

export const parseTransactionDate = (date: string) => {
  const parsedDate = new Date(`${date}T00:00:00`);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export const formatIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatSubscriptionDate = (date: Date) => {
  return `${date.getDate()} ${calendarMonths[date.getMonth()].dateName}`;
};

export const formatShortDate = (date: Date) => {
  return `${date.getDate()} ${calendarMonths[date.getMonth()].shortLabel}`;
};

export const getPeriodStep = (period: string): PeriodStep => {
  switch (period) {
    case "разовая":
      return {
        unit: "once"
      };
    case "неделя":
      return {
        amount: 7,
        unit: "days"
      };
    case "3 месяца":
      return {
        amount: 3,
        unit: "months"
      };
    case "6 месяцев":
      return {
        amount: 6,
        unit: "months"
      };
    case "год":
      return {
        amount: 12,
        unit: "months"
      };
    default:
      return {
        amount: 1,
        unit: "months"
      };
  }
};

export const addPeriod = (date: Date, step: PeriodStep, sourceDay: number) => {
  if (step.unit === "once") {
    return date;
  }

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

export const getRegistrationDate = (
  subscription: Subscription,
  currentDate = new Date()
) => {
  const registeredAt = parseIsoDate(subscription.registeredAt);

  if (registeredAt) {
    return registeredAt;
  }

  const parsedDate = parseSubscriptionDate(subscription.date);

  if (!parsedDate) {
    return currentDate;
  }

  return new Date(
    currentDate.getFullYear(),
    parsedDate.monthIndex,
    parsedDate.day
  );
};

export const getSubscriptionExpirationDate = (subscription: Subscription) => {
  if (!subscription.expiresAt) {
    return null;
  }

  const expirationDate = parseIsoDate(subscription.expiresAt);

  return expirationDate ? toDateOnly(expirationDate) : null;
};

export const getOccurrencesInRange = (
  subscription: Subscription,
  start: Date,
  end: Date,
  currentDate = new Date()
) => {
  const registrationDate = toDateOnly(
    getRegistrationDate(subscription, currentDate)
  );
  const expirationDate = getSubscriptionExpirationDate(subscription);
  const rangeEnd =
    expirationDate && expirationDate < end ? expirationDate : end;
  const step = getPeriodStep(subscription.period);
  const sourceDay = registrationDate.getDate();
  const occurrences: Date[] = [];
  let paymentDate = registrationDate;
  let attempts = 0;

  if (step.unit === "once") {
    return paymentDate >= start && paymentDate <= rangeEnd
      ? [paymentDate]
      : [];
  }

  while (paymentDate < start && attempts < 600) {
    paymentDate = addPeriod(paymentDate, step, sourceDay);
    attempts += 1;
  }

  while (paymentDate <= rangeEnd && attempts < 700) {
    occurrences.push(paymentDate);
    paymentDate = addPeriod(paymentDate, step, sourceDay);
    attempts += 1;
  }

  return occurrences;
};

export const getNextPaymentDate = (
  subscription: Subscription,
  fromDate = new Date()
) => {
  const registrationDate = getRegistrationDate(subscription, fromDate);
  const expirationDate = getSubscriptionExpirationDate(subscription);
  const step = getPeriodStep(subscription.period);
  const sourceDay = registrationDate.getDate();
  const today = toDateOnly(fromDate);
  let paymentDate = toDateOnly(registrationDate);
  let attempts = 0;

  if (step.unit === "once") {
    return paymentDate >= today &&
      (!expirationDate || paymentDate <= expirationDate)
      ? paymentDate
      : null;
  }

  while (paymentDate < today && attempts < 600) {
    paymentDate = addPeriod(paymentDate, step, sourceDay);
    attempts += 1;
  }

  return expirationDate && paymentDate > expirationDate ? null : paymentDate;
};

export const getMonthlyEquivalent = (subscription: Subscription) => {
  if (subscription.period === "разовая") {
    return 0;
  }

  if (subscription.period === "неделя") {
    return (subscription.price * 52) / 12;
  }

  if (subscription.period === "3 месяца") {
    return subscription.price / 3;
  }

  if (subscription.period === "6 месяцев") {
    return subscription.price / 6;
  }

  if (subscription.period === "год") {
    return subscription.price / 12;
  }

  return subscription.price;
};
