import {Capacitor} from "@capacitor/core";
import {defineCustomElements as defineJeepSqliteCustomElements} from "jeep-sqlite/loader";

import {AppDataSource} from "./data-source";
import {sqliteConnection} from "./data-source";

let initializationPromise: Promise<typeof AppDataSource> | null = null;

const initWebDatabase = async () => {
  if (Capacitor.getPlatform() !== "web") {
    return;
  }

  await defineJeepSqliteCustomElements(window);

  if (!document.querySelector("jeep-sqlite")) {
    const jeepSqlite = document.createElement("jeep-sqlite");

    document.body.appendChild(jeepSqlite);
  }

  await sqliteConnection.initWebStore();
};

export const initDatabase = async () => {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = initWebDatabase()
    .then(() => {
      return AppDataSource.initialize();
    })
    .then(() => {
      return AppDataSource;
    })
    .catch((error) => {
      initializationPromise = null;
      throw error;
    });

  return initializationPromise;
};

export const getDatabase = () => {
  if (!AppDataSource.isInitialized) {
    throw new Error("Database is not initialized. Call initDatabase() first.");
  }

  return AppDataSource;
};
