import {CapacitorSQLite, SQLiteConnection} from "@capacitor-community/sqlite";
import {DataSource} from "typeorm";

import {CategoryEntity} from "@/database/entities/category.entity";
import {SubscriptionEntity} from "@/database/entities/subscription.entity";
import {TransactionEntity} from "@/database/entities/transaction.entity";

export const sqliteConnection = new SQLiteConnection(CapacitorSQLite);

export const AppDataSource = new DataSource({
  type: "capacitor",
  driver: sqliteConnection,
  database: "subly",
  mode: "no-encryption",
  version: 1,
  entities: [CategoryEntity, SubscriptionEntity, TransactionEntity],
  synchronize: true,
  logging: false
});
