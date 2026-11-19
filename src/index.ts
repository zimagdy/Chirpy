import "./types.js";
import express from "express";
import {
  middlewareLogResponses,
  middlewareMetricsInc,
} from "./middleware/verify.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { config } from "./config.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { chirpsRouter } from "./routes/chirps.js";
import { usersRouter } from "./routes/users.js";
import { adminRouter } from "./routes/admin.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();
const PORT = 8080;

app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));
app.use(middlewareLogResponses);
app.use(express.json());

app.get("/api/healthz", (req, res) => {
  res.set({
    "Content-Type": "text/plain",
  });
  res.send("OK");
});

// Routes
app.use(chirpsRouter);
app.use(usersRouter);
app.use(adminRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server work on http://localhost:${PORT}`);
});
