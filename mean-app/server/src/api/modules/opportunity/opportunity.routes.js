import express from "express";
import {
  createOpportunity,
  getOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
    applyToOpportunity   // ✅ Add this line

} from "./opportunity.controller.js";

const router = express.Router();

router.post("/", createOpportunity);
router.get("/", getOpportunities);
router.get("/:id", getOpportunityById);
router.put("/:id", updateOpportunity);
router.delete("/:id", deleteOpportunity);
// POST /api/opportunities/:id/apply
router.post("/:id/apply", applyToOpportunity);

export default router;
