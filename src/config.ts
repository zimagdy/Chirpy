import z from "zod";
import type { MigrationConfig } from "drizzle-orm/migrator";

// Load env
process.loadEnvFile();

// validation
const envObject = z.object({
  DB_URL: z.string().startsWith("postgres://"),
  PORT: z.coerce.number().positive().default(8080),
  PLATFORM: z.string(),
  SECRET_KEY: z.string(),
});

const envOrThrow = () => {
  const env = envObject.parse(process.env);
  return env;
};

const env = envOrThrow();

// Config Types
type APIConfig = {
  fileserverHits: number;
  port: number;
  platform: string;
  key: string;
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

type Config = {
  api: APIConfig;
  db: DBConfig;
};

// Initalize configs
const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

export const config: Config = {
  api: {
    fileserverHits: 0,
    port: env.PORT,
    platform: env.PLATFORM,
    key: env.SECRET_KEY,
  },
  db: {
    url: env.DB_URL,
    migrationConfig,
  },
};
