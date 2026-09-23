import type {EntityManager} from "typeorm";

import {getDatabase} from "@/database/database";
import {
  CategoryEntity,
  type CategoryEntityModel
} from "@/database/entities/category.entity";
import {
  SubscriptionEntity,
  type SubscriptionEntityModel
} from "@/database/entities/subscription.entity";
import {
  TransactionEntity,
  type TransactionEntityModel
} from "@/database/entities/transaction.entity";

export type DatabaseSnapshot = {
  categories: Category[];
  subscriptions: Subscription[];
};

const normalizeName = (name: string) => {
  return name.trim();
};

const toCategory = (category: CategoryEntityModel): Category => {
  return {
    id: category.id,
    name: category.name
  };
};

const toTransaction = (transaction: Transaction): Transaction => {
  return {
    id: transaction.id,
    date: transaction.date
  };
};

const toSubscription = (
  subscription: SubscriptionEntityModel
): Subscription => {
  return {
    id: subscription.id,
    name: subscription.name,
    price: Number(subscription.price),
    date: subscription.date,
    period: subscription.period,
    colorClass: subscription.colorClass,
    icon: subscription.icon,
    isActive: Boolean(subscription.isActive),
    registeredAt: subscription.registeredAt,
    reminderDays: Number(subscription.reminderDays),
    category: subscription.category ? toCategory(subscription.category) : undefined,
    transactions: [...(subscription.transactions ?? [])]
      .map(toTransaction)
      .sort((first, second) => {
        return first.date.localeCompare(second.date);
      })
  };
};

const getCategoryRepository = (manager?: EntityManager) => {
  return (manager ?? getDatabase().manager).getRepository<CategoryEntityModel>(
    CategoryEntity
  );
};

const getSubscriptionRepository = (manager?: EntityManager) => {
  return (manager ?? getDatabase().manager).getRepository<SubscriptionEntityModel>(
    SubscriptionEntity
  );
};

const getTransactionRepository = (manager?: EntityManager) => {
  return (manager ?? getDatabase().manager).getRepository<TransactionEntityModel>(
    TransactionEntity
  );
};

const findCategoryByName = async (name: string, manager?: EntityManager) => {
  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    return null;
  }

  const categories = await getCategoryRepository(manager).find();

  return (
    categories.find((category) => {
      return category.name.toLowerCase() === normalizedName.toLowerCase();
    }) ?? null
  );
};

const resolveCategory = async (
  category?: Category | null,
  manager?: EntityManager
) => {
  if (!category) {
    return null;
  }

  const categoryRepository = getCategoryRepository(manager);
  const existingById = await categoryRepository.findOne({
    where: {
      id: category.id
    }
  });

  if (existingById) {
    return existingById;
  }

  const existingByName = await findCategoryByName(category.name, manager);

  if (existingByName) {
    return existingByName;
  }

  return categoryRepository.save({
    name: normalizeName(category.name)
  } as CategoryEntityModel);
};

const findSubscriptionById = async (id: number, manager?: EntityManager) => {
  const subscription = await getSubscriptionRepository(manager).findOne({
    where: {
      id
    },
    relations: {
      category: true,
      transactions: true
    }
  });

  return subscription ? toSubscription(subscription) : null;
};

const replaceTransactions = async (
  subscriptionId: number,
  transactions: Transaction[],
  manager: EntityManager
) => {
  const transactionRepository = getTransactionRepository(manager);

  await transactionRepository
    .createQueryBuilder()
    .delete()
    .from(TransactionEntity)
    .where("subscription_id = :subscriptionId", {subscriptionId})
    .execute();

  if (transactions.length === 0) {
    return;
  }

  await transactionRepository.save(
    transactions.map((transaction) => {
      return {
        date: transaction.date,
        subscription: {
          id: subscriptionId
        }
      } as TransactionEntityModel;
    })
  );
};

const saveSubscription = async (
  subscription: Subscription,
  manager: EntityManager
) => {
  const category = await resolveCategory(subscription.category, manager);
  const subscriptionRepository = getSubscriptionRepository(manager);
  const savedSubscription = await subscriptionRepository.save({
    id: subscription.id > 0 ? subscription.id : undefined,
    name: subscription.name,
    price: subscription.price,
    date: subscription.date,
    period: subscription.period,
    colorClass: subscription.colorClass,
    icon: subscription.icon,
    isActive: subscription.isActive,
    registeredAt: subscription.registeredAt,
    reminderDays: subscription.reminderDays,
    category
  } as SubscriptionEntityModel);

  await replaceTransactions(
    savedSubscription.id,
    subscription.transactions,
    manager
  );

  return savedSubscription.id;
};

export const subscriptionRepository = {
  async seedCategories(categories: Category[]) {
    const categoryRepository = getCategoryRepository();
    const existingCategories = await categoryRepository.find();
    const missingCategories = categories.filter((category) => {
      return !existingCategories.some((existingCategory) => {
        return (
          existingCategory.name.toLowerCase() === category.name.toLowerCase()
        );
      });
    });

    if (missingCategories.length > 0) {
      await categoryRepository.save(
        missingCategories.map((category) => {
          return {
            name: normalizeName(category.name)
          } as CategoryEntityModel;
        })
      );
    }
  },

  async getSnapshot(): Promise<DatabaseSnapshot> {
    const [categories, subscriptions] = await Promise.all([
      getCategoryRepository().find({
        order: {
          id: "ASC"
        }
      }),
      getSubscriptionRepository().find({
        relations: {
          category: true,
          transactions: true
        },
        order: {
          id: "ASC"
        }
      })
    ]);

    return {
      categories: categories.map(toCategory),
      subscriptions: subscriptions.map(toSubscription)
    };
  },

  async addCategory(name: string) {
    const normalizedName = normalizeName(name);

    if (!normalizedName) {
      return null;
    }

    const existingCategory = await findCategoryByName(normalizedName);

    if (existingCategory) {
      return toCategory(existingCategory);
    }

    const category = await getCategoryRepository().save({
      name: normalizedName
    } as CategoryEntityModel);

    return toCategory(category);
  },

  async updateCategory(id: number, name: string) {
    const normalizedName = normalizeName(name);

    if (!normalizedName) {
      return null;
    }

    const categoryRepository = getCategoryRepository();
    const existingCategory = await categoryRepository.findOne({
      where: {
        id
      }
    });

    if (!existingCategory) {
      return null;
    }

    const duplicatedCategory = await findCategoryByName(normalizedName);

    if (duplicatedCategory && duplicatedCategory.id !== id) {
      return null;
    }

    existingCategory.name = normalizedName;

    const category = await categoryRepository.save(existingCategory);

    return toCategory(category);
  },

  async deleteCategory(id: number) {
    await getDatabase().transaction(async (manager) => {
      await getSubscriptionRepository(manager)
        .createQueryBuilder()
        .update(SubscriptionEntity)
        .set({
          category: null
        } as Partial<SubscriptionEntityModel>)
        .where("category_id = :categoryId", {categoryId: id})
        .execute();

      await getCategoryRepository(manager).delete(id);
    });
  },

  async addSubscription(subscription: Subscription) {
    const savedId = await getDatabase().transaction(async (manager) => {
      return saveSubscription(subscription, manager);
    });

    return findSubscriptionById(savedId);
  },

  async updateSubscription(id: number, subscription: Subscription) {
    const savedId = await getDatabase().transaction(async (manager) => {
      return saveSubscription(
        {
          ...subscription,
          id
        },
        manager
      );
    });

    return findSubscriptionById(savedId);
  },

  async deleteSubscription(id: number) {
    await getDatabase().transaction(async (manager) => {
      await getTransactionRepository(manager)
        .createQueryBuilder()
        .delete()
        .from(TransactionEntity)
        .where("subscription_id = :subscriptionId", {subscriptionId: id})
        .execute();

      await getSubscriptionRepository(manager).delete(id);
    });
  },

  async saveSubscriptions(subscriptions: Subscription[]) {
    await getDatabase().transaction(async (manager) => {
      for (const subscription of subscriptions) {
        await saveSubscription(subscription, manager);
      }
    });

    return this.getSnapshot();
  },

  async replaceSnapshot(snapshot: DatabaseSnapshot) {
    await getDatabase().transaction(async (manager) => {
      await getTransactionRepository(manager).clear();
      await getSubscriptionRepository(manager).clear();
      await getCategoryRepository(manager).clear();

      const categoryRepository = getCategoryRepository(manager);

      for (const category of snapshot.categories) {
        await categoryRepository.save({
          id: category.id > 0 ? category.id : undefined,
          name: normalizeName(category.name)
        } as CategoryEntityModel);
      }

      for (const subscription of snapshot.subscriptions) {
        await saveSubscription(subscription, manager);
      }
    });

    return this.getSnapshot();
  },

  async clearAllData(categories: Category[]) {
    await getDatabase().transaction(async (manager) => {
      await getTransactionRepository(manager).clear();
      await getSubscriptionRepository(manager).clear();
      await getCategoryRepository(manager).clear();
    });

    await this.seedCategories(categories);

    return this.getSnapshot();
  }
};
