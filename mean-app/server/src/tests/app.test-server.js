import express from "express";

export async function createTestApp() {
  const app = express();
  app.use(express.json());
  const { default: userRoutes } = await import("../api/modules/user/user.routes.js");
  app.use("/api", userRoutes);
  app.get("/health", (req, res) => res.json({ status: "ok" }));
  return app;
}


