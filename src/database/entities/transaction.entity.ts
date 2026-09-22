import {EntitySchema} from "typeorm";

export type TransactionEntityModel = Transaction & {
  subscription: Subscription;
};

export const TransactionEntity = new EntitySchema<TransactionEntityModel>({
  name: "Transaction",
  tableName: "transactions",
  columns: {
    id: {
      type: "integer",
      primary: true,
      generated: true
    },
    date: {
      type: "text",
      nullable: false
    }
  },
  relations: {
    subscription: {
      target: "Subscription",
      type: "many-to-one",
      inverseSide: "transactions",
      joinColumn: {
        name: "subscription_id",
        referencedColumnName: "id"
      },
      nullable: false,
      onDelete: "CASCADE"
    }
  }
});
