import { getDashboardData } from "./dashboard.service.js";

async function dashboard(req, res) {
  try {
    const data = await getDashboardData();
    res.json(data);
  } catch (error) {
    console.error("Dashboard controller error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export { dashboard };
