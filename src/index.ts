import express from "express";
import {
  middlewareCheckChirpy,
  middlewareCheckUser,
  middlewareLogResponses,
  middlewareMetricsInc,
} from "./middleware/verify.js";
import { error400, errorHandler } from "./middleware/errorHandler.js";
import { config } from "./config.js";
import { replaceProfane } from "./utils/replace.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { createUser, deleteUsers } from "./db/queries/users.js";
import { createChirpy, getChirps } from "./db/queries/chirps.js";

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

// Send the hits
app.get("/admin/metrics", (req, res) => {
  res.set({
    "Content-Type": "text/html; charset=utf-8",
  });
  res.send(`
  <html>
    <body>
      <h1>Welcome, Chirpy Admin</h1>
      <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
    </body>
  </html>`);
});

// Get chirps
app.get("/api/chirps/:chirpId", middlewareCheckChirpy, (req, res) => {
  res.status(200).json({
    ...req.body,
  });
});

// Reset hits
app.post("/admin/reset", async (req, res) => {
  const platform = config.api.platform;

  if (platform !== "dev") {
    return res.status(403).json({
      message: "Forbidden",
    });
  }
  await deleteUsers();
  res.send("Deleted successfully");
});

app.post("/api/chirps", middlewareCheckUser, async (req, res) => {
  const body = req.body.body;
  const userId = req.body.userId;

  if (body === undefined || body.length === 0) {
    return res.status(400).json({
      error: "Chirp can not empty string",
    });
  }

  if (body.length > 140) {
    throw new error400("Chirp is too long. Max length is 140");
  }

  const newBody = replaceProfane(body);

  const chirpy = await createChirpy(userId, newBody);

  return res.status(201).json({
    ...chirpy,
  });
});

// Create a user
app.post("/api/users", async (req, res) => {
  const email = req.body.email;

  if (email === undefined || email.length === 0) {
    throw new error400("Email can not empty");
  }

  const user = await createUser(email);

  return res.status(201).json({
    message: "User created successfully",
    ...user,
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server work on http://localhost:${PORT}`);
});
