import express from "express";
import {
  middlewareLogResponses,
  middlewareMetricsInc,
} from "./middleware/verify.js";
import { Config } from "./config.js";
import { replaceProfane } from "./utils/replace.js";

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
      <p>Chirpy has been visited ${Config.fileserverHits} times!</p>
    </body>
  </html>`);
});

// Reset hits
app.post("/admin/reset", (req, res) => {
  Config.fileserverHits = 0;
  res.send("Hits reset successfully");
});

app.post("/api/validate_chirp", (req, res) => {
  try {
    const body = req.body.body;

    if (body === undefined || body.length === 0) {
      return res.status(400).json({
        error: "Chirp can not empty string",
      });
    }

    if (body.length > 140) {
      return res.status(400).json({
        error: "Chirp is too long",
      });
    }

    const newBody = replaceProfane(body);

    return res.status(200).json({
      cleanedBody: newBody,
    });
  } catch (e) {
    console.log("Validation Failed ", e);
    return res.status(500).json({
      error: "Server is not work now, try again later... ",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server work on http://localhost:${PORT}`);
});
