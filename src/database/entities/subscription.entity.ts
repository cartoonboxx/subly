import {EntitySchema} from "typeorm";

export type SubscriptionEntityModel = Omit<
  Subscription,
  "category" | "transactions"
> & {
  category?: Category | null;
  transactions?: Transaction[];
};

export const SubscriptionEntity = new EntitySchema<SubscriptionEntityModel>({
  name: "Subscription",
  tableName: "subscriptions",
  columns: {
    id: {
      type: "integer",
      primary: true,
      generated: true
    },

    name: {
      type: "text",
      nullable: false
    },

    price: {
      type: "float",
      nullable: false
    },
    date: {
      type: "text",
      nullable: false
    },
    period: {
      type: "text",
      nullable: false
    },
    colorClass: {
      type: "text",
      name: "color_class",
      nullable: false
    },
    icon: {
      type: "text",
      nullable: false
    },
    isActive: {
      type: "boolean",
      name: "is_active",
      nullable: false,
      default: true
    },
    registeredAt: {
      type: "text",
      name: "registered_at",
      nullable: false
    },
    reminderDays: {
      type: "integer",
      name: "reminder_days",
      nullable: false,
      default: 3
    },
    expiresAt: {
      type: "text",
      name: "expires_at",
      nullable: true
    }
  },
  relations: {
    category: {
      target: "Category",
      type: "many-to-one",
      inverseSide: "subscriptions",
      joinColumn: {
        name: "category_id",
        referencedColumnName: "id"
      },
      nullable: true,
      onDelete: "SET NULL"
    },
    transactions: {
      target: "Transaction",
      type: "one-to-many",
      inverseSide: "subscription",
      cascade: ["insert", "update"],
      orphanedRowAction: "delete"
    }
  }
});
