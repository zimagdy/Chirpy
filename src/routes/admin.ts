import { Router } from "express";
import { requireDev } from "../middleware/auth.js";
import { config } from "../config.js";
import { deleteUsers } from "../db/queries/users.js";

export const adminRouter = Router();

// Admin metrics
adminRouter.get("/admin/metrics", (req, res) => {
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

// Reset database (dev only)
adminRouter.post("/admin/reset", requireDev, async (req, res) => {
  await deleteUsers();
  res.send("Deleted successfully");
});
