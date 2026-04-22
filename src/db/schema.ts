import * as SQLite from 'expo-sqlite'

let db: SQLite.SQLiteDatabase | null = null

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db
  db = await SQLite.openDatabaseAsync('paimon-planner.db')
  await initSchema(db)
  return db
}

async function initSchema(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS recommended_builds (
      id TEXT PRIMARY KEY,
      character_id TEXT NOT NULL,
      character_name TEXT NOT NULL,
      role TEXT NOT NULL,
      artifact_sets TEXT NOT NULL,
      main_stats TEXT NOT NULL,
      substat_priority TEXT NOT NULL,
      weapons TEXT NOT NULL,
      team_comps TEXT,
      notes TEXT,
      source TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS farm_items (
      id TEXT PRIMARY KEY,
      character_id TEXT NOT NULL,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      domain TEXT,
      available_days TEXT,
      completed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `)
}
