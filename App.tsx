import { ActivityIndicator, Text, View } from "react-native";

import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import * as SQLite from "expo-sqlite";
import migrations from "./drizzle/migrations";

import { Home } from "./src/app/home";

const DATABASE_NAME = "database.db";
const expoDB = SQLite.openDatabaseSync(DATABASE_NAME);
const db = drizzle(expoDB);

export default function App() {
  const { success, error } = useMigrations(db, migrations);

  useDrizzleStudio(expoDB);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <ActivityIndicator
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  return (
    <SQLite.SQLiteProvider databaseName={DATABASE_NAME}>
      <Home />
    </SQLite.SQLiteProvider>
  );
}
