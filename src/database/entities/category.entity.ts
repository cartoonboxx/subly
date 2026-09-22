import {EntitySchema} from "typeorm";

export type CategoryEntityModel = Category & {
  subscriptions?: Subscription[];
};

export const CategoryEntity = new EntitySchema<CategoryEntityModel>({
  name: "Category",
  tableName: "categories",
  columns: {
    id: {
      type: "integer",
      primary: true,
      generated: true
    },
    name: {
      type: "text",
      nullable: false,
      unique: true
    }
  },
  relations: {
    subscriptions: {
      target: "Subscription",
      type: "one-to-many",
      inverseSide: "category"
    }
  }
});
