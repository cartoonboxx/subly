import {defineStore} from "pinia";
import {
  DatabaseSnapshot,
  subscriptionRepository
} from "@/database/repositories/subscription.repository";
import {
  addPeriod,
  formatIsoDate,
  formatSubscriptionDate,
  getPeriodStep,
  getRegistrationDate,
  parseIsoDate,
  toDateOnly
} from "@/utils/subscriptionBilling";
import {scheduleSubscriptionExpirationNotifications} from "@/utils/localNotifications";

export const DEFAULT_CATEGORIES: Category[] = [
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
  },
  {
    id: 5,
    name: "Игры"
  },
  {
    id: 6,
    name: "Образование"
  },
  {
    id: 7,
    name: "AI"
  },
  {
    id: 8,
    name: "Финансы"
  },
  {
    id: 9,
    name: "Связь"
  },
  {
    id: 10,
    name: "Новости"
  },
  {
    id: 11,
    name: "Здоровье"
  },
  {
    id: 12,
    name: "Дом"
  },
  {
    id: 13,
    name: "Покупки"
  },
  {
    id: 14,
    name: "Другое"
  }
];

const getDefaultCategories = () => {
  return DEFAULT_CATEGORIES.map((category) => {
    return {
      ...category
    };
  });
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
  const transactions: Transaction[] = [];
  let transactionDate = registrationDate;
  let transactionId = 1;

  if (step.unit === "once") {
    return registrationDate <= today
      ? [
          {
            id: transactionId,
            date: formatIsoDate(registrationDate)
          }
        ]
      : [];
  }

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

  if (step.unit === "once") {
    return paymentDate;
  }

  while (paymentDate < today) {
    paymentDate = addPeriod(paymentDate, step, sourceDay);
  }

  return paymentDate;
};

const getOneTimeExpirationDate = (subscription: Subscription) => {
  const registrationDate = toDateOnly(getRegistrationDate(subscription));

  return addPeriod(
    registrationDate,
    {
      amount: 1,
      unit: "months"
    },
    registrationDate.getDate()
  );
};

const syncSubscriptionBilling = (
  subscription: Subscription,
  currentDate = new Date()
) => {
  const transactions = buildTransactions(subscription, currentDate);
  const today = toDateOnly(currentDate);

  if (!subscription.isActive) {
    return {
      ...subscription,
      transactions
    };
  }

  if (
    subscription.period === "разовая" &&
    getOneTimeExpirationDate(subscription) <= today
  ) {
    return {
      ...subscription,
      isActive: false,
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
    subscriptions: [] as Subscription[],
    categories: getDefaultCategories(),
    errorMessage: "",
    isInitialized: false,
    isLoading: false
  }),
  getters: {
    getSubscriptions: (state) => state.subscriptions
  },
  actions: {
    async syncLocalNotifications() {
      try {
        await scheduleSubscriptionExpirationNotifications(this.subscriptions);
      } catch (error) {
        console.warn("Failed to schedule subscription notifications", error);
      }
    },

    async loadFromDatabase() {
      this.isLoading = true;
      this.errorMessage = "";

      try {
        await subscriptionRepository.seedCategories(DEFAULT_CATEGORIES);

        const snapshot = await subscriptionRepository.getSnapshot();
        const normalizedSubscriptions = snapshot.subscriptions.map(
          (subscription) => {
            return syncSubscriptionBilling(subscription);
          }
        );

        const syncedSnapshot = await subscriptionRepository.saveSubscriptions(
          normalizedSubscriptions
        );

        this.categories = syncedSnapshot.categories;
        this.subscriptions = syncedSnapshot.subscriptions;
        this.isInitialized = true;
      } catch (error) {
        this.errorMessage = "Не удалось загрузить данные из базы";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async addSubscription(subscription: CreateSubscriptionInput) {
      const draftSubscription: Subscription = {
        ...subscription,
        date: subscription.date ?? getInitialSubscriptionDate(subscription),
        id: 0,
        transactions: subscription.transactions ?? []
      };
      const syncedSubscription = syncSubscriptionBilling(draftSubscription);

      try {
        const createdSubscription =
          await subscriptionRepository.addSubscription(syncedSubscription);

        if (!createdSubscription) {
          return null;
        }

        this.subscriptions.push(createdSubscription);
        await this.syncLocalNotifications();

        return createdSubscription;
      } catch (error) {
        this.errorMessage = "Не удалось сохранить подписку";
        throw error;
      }
    },

    async updateSubscription(
      id: number,
      subscription: UpdateSubscriptionInput
    ) {
      const subscriptionIndex = this.subscriptions.findIndex((item) => {
        return item.id === id;
      });

      if (subscriptionIndex === -1) {
        return null;
      }

      const updatedSubscription = syncSubscriptionBilling({
        ...this.subscriptions[subscriptionIndex],
        ...subscription
      });

      try {
        const savedSubscription =
          await subscriptionRepository.updateSubscription(
            id,
            updatedSubscription
          );

        if (!savedSubscription) {
          return null;
        }

        this.subscriptions[subscriptionIndex] = savedSubscription;
        await this.syncLocalNotifications();

        return savedSubscription;
      } catch (error) {
        this.errorMessage = "Не удалось обновить подписку";
        throw error;
      }
    },

    async deleteSubscription(id: number) {
      const subscriptionIndex = this.subscriptions.findIndex((item) => {
        return item.id === id;
      });

      if (subscriptionIndex === -1) {
        return;
      }

      try {
        await subscriptionRepository.deleteSubscription(id);
        this.subscriptions.splice(subscriptionIndex, 1);
        await this.syncLocalNotifications();
      } catch (error) {
        this.errorMessage = "Не удалось удалить подписку";
        throw error;
      }
    },

    async addCategory(name: string) {
      const normalizedName = name.trim();

      if (!normalizedName) {
        return null;
      }

      const existingCategory = this.categories.find((category) => {
        return category.name.toLowerCase() === normalizedName.toLowerCase();
      });

      if (existingCategory) {
        return existingCategory;
      }

      try {
        const category =
          await subscriptionRepository.addCategory(normalizedName);

        if (!category) {
          return null;
        }

        this.categories.push(category);

        return category;
      } catch (error) {
        this.errorMessage = "Не удалось сохранить категорию";
        throw error;
      }
    },

    async updateCategory(id: number, name: string) {
      try {
        const category = await subscriptionRepository.updateCategory(id, name);

        if (!category) {
          this.errorMessage = "Не удалось обновить категорию";
          return null;
        }

        const snapshot = await subscriptionRepository.getSnapshot();

        this.categories = snapshot.categories;
        this.subscriptions = snapshot.subscriptions;

        return category;
      } catch (error) {
        this.errorMessage = "Не удалось обновить категорию";
        throw error;
      }
    },

    async deleteCategory(id: number) {
      try {
        await subscriptionRepository.deleteCategory(id);

        const snapshot = await subscriptionRepository.getSnapshot();

        this.categories = snapshot.categories;
        this.subscriptions = snapshot.subscriptions;
      } catch (error) {
        this.errorMessage = "Не удалось удалить категорию";
        throw error;
      }
    },

    async exportSnapshot() {
      return subscriptionRepository.getSnapshot();
    },

    async importSnapshot(snapshot: DatabaseSnapshot) {
      try {
        const importedSnapshot =
          await subscriptionRepository.replaceSnapshot(snapshot);

        this.categories = importedSnapshot.categories;
        this.subscriptions = importedSnapshot.subscriptions;
        await this.syncLocalNotifications();
      } catch (error) {
        this.errorMessage = "Не удалось импортировать данные";
        throw error;
      }
    },

    async clearData() {
      try {
        const snapshot =
          await subscriptionRepository.clearAllData(DEFAULT_CATEGORIES);

        this.categories = snapshot.categories;
        this.subscriptions = snapshot.subscriptions;
        await this.syncLocalNotifications();
      } catch (error) {
        this.errorMessage = "Не удалось очистить данные";
        throw error;
      }
    },

    normalizeExpiredSubscriptions(currentDate = new Date()) {
      this.subscriptions = this.subscriptions.map((subscription) => {
        return syncSubscriptionBilling(subscription, currentDate);
      });
    },

    async syncExpiredSubscriptions(currentDate = new Date()) {
      this.normalizeExpiredSubscriptions(currentDate);

      const snapshot = await subscriptionRepository.saveSubscriptions(
        this.subscriptions
      );

      this.categories = snapshot.categories;
      this.subscriptions = snapshot.subscriptions;
      await this.syncLocalNotifications();
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
