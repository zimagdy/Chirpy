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
import { createUser, deleteUsers, getUserByEmail } from "./db/queries/users.js";
import { createChirpy } from "./db/queries/chirps.js";
import { checkPasswordHash, hashPassword } from "./utils/password.js";
import { getBearerToken, makeJWT, makeRefreshToken } from "./utils/auth.js";
import {
  createRefreshToken,
  getRefreshToken,
  revokeUpdate,
} from "./db/queries/refreshToken.js";

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
  const userPassword = req.body.password;

  if (email === undefined || email.length === 0) {
    throw new error400("Email can not empty");
  }

  if (userPassword === undefined || userPassword.length === 0) {
    throw new error400("Password can not empty");
  }

  const hashedPassword = await hashPassword(userPassword);

  const user = await createUser(email, hashedPassword);

  const { password, ...newUser } = user;

  return res.status(201).json({
    message: "User created successfully",
    ...newUser,
  });
});

// Login
app.post("/api/login", async (req, res) => {
  const email = req.body.email;
  const userPassword = req.body.password;
  let expiresInSeconds = req.body.expiresInSeconds;

  if (email === undefined || email.length === 0) {
    throw new error400("Email can not empty");
  }

  if (userPassword === undefined || userPassword.length === 0) {
    throw new error400("Password can not empty");
  }

  if (
    expiresInSeconds === undefined ||
    expiresInSeconds > 3600 ||
    expiresInSeconds <= 0
  ) {
    expiresInSeconds = 3600;
  }

  const user = await getUserByEmail(email);

  const check = await checkPasswordHash(userPassword, user.password);

  if (!check) {
    return res.status(401).json({
      message: "Incorrect email or password",
    });
  }

  const token = makeJWT(user.id, expiresInSeconds, config.api.key);
  const { password, ...result } = user;

  // create a refresh token
  const refreshToken = makeRefreshToken();

  await createRefreshToken(user.id, refreshToken);

  return res.status(200).json({
    ...result,
    token,
    refreshToken,
  });
});

// Refresh token
app.post("/api/refresh/", async (req, res) => {
  try {
    // get the refresh token
    const token = getBearerToken(req);

    const refreshToken = await getRefreshToken(token);

    if (
      !refreshToken ||
      refreshToken.expiresAt < new Date() ||
      refreshToken.revokedAt !== null
    ) {
      return res.status(401).json({
        error: "Refresh token is not valid",
      });
    }

    const newToken = makeJWT(refreshToken.userId, 3600, config.api.key);

    return res.status(200).json({
      token: newToken,
    });
  } catch (e) {
    console.error("Refresh Token Failed ", e);
    throw e;
  }
});

// Revoke
app.post("/api/revoke/", async (req, res) => {
  try {
    // get the refresh token
    const token = getBearerToken(req);

    await revokeUpdate(token);

    res.status(204).json({
      message: "Everthing is work",
    });
  } catch (e) {
    console.error("Revoked update failed ", e);
    throw e;
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server work on http://localhost:${PORT}`);
});
