import express from "express";
import {
  middlewareLogResponses,
  middlewareMetricsInc,
} from "./middleware/verify.js";
import { Config } from "./config.js";

const app = express();
const PORT = 8080;

app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));
app.use(middlewareLogResponses);

app.get("/healthz", (req, res) => {
  res.set({
    "Content-Type": "text/plain",
  });
  res.send("OK");
});

// Send the hits
app.get("/metrics", (req, res) => {
  res.send(`Hits: ${Config.fileserverHits}`);
});

// Reset hits
app.get("/reset", (req, res) => {
  Config.fileserverHits = 0;
  res.send("Hits reset successfully");
});

app.listen(PORT, () => {
  console.log(`Server work on http://localhost:${PORT}`);
});
