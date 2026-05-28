import Constraint from '../models/constraint.model.js';

// GET current constraints for user (create defaults if none exist)
export const getConstraints = async (req, res) => {
  try {
    let constraint = await Constraint.findOne({ userId: req.userId });
    if (!constraint) {
      constraint = await Constraint.create({ userId: req.userId });
    }
    res.json(constraint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT update constraints
export const updateConstraints = async (req, res) => {
  try {
    let constraint = await Constraint.findOne({ userId: req.userId });
    if (!constraint) {
      constraint = await Constraint.create({ ...req.body, userId: req.userId });
    } else {
      Object.assign(constraint, req.body);
      await constraint.save();
    }
    res.json(constraint);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
