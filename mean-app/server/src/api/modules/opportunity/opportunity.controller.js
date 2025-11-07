import Opportunity from "./opportunity.model.js";

// CREATE
export const createOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.create(req.body);
    res.status(201).json(opportunity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ALL
export const getOpportunities = async (req, res) => {
  try {
    const list = await Opportunity.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
export const getOpportunityById = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ message: "Not found" });
    res.json(opportunity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updateOpportunity = async (req, res) => {
  try {
    const updated = await Opportunity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
export const deleteOpportunity = async (req, res) => {
  try {
    const deleted = await Opportunity.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Accept a simple application payload: { userId, appliedAt, message }
export const applyToOpportunity = async (req, res) => {
  try {
    const opportunityId = req.params.id;
    const { userId, appliedAt, message } = req.body;

    // Minimal validation
    if (!opportunityId || !userId) {
      return res.status(400).json({ message: 'Missing opportunityId or userId' });
    }

    // For now: persist applications in a new collection or embedded array.

    const Opportunity = require('./opportunity.model').default || require('./opportunity.model');
    const opp = await Opportunity.findById(opportunityId);
    if (!opp) return res.status(404).json({ message: 'Opportunity not found' });

    // Add applicants array if not present
    if (!opp.applicants) opp.applicants = [];
    opp.applicants.push({
      userId,
      message: message || '',
      appliedAt: appliedAt || new Date()
    });

    await opp.save();

    res.json({ message: 'Application received' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};
