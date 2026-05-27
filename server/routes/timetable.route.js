import express from 'express';
import Course from '../models/course.model.js';
import Constraint from '../models/constraint.model.js';
import Timetable from '../models/timetable.model.js';
import Room from '../models/room.model.js';
import Scheduler from '../services/scheduler.service.js';
import ConflictDetector from '../services/conflictDetector.service.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(auth);

// POST generate timetable
router.post('/generate', async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.userId });
    if (courses.length === 0) {
      return res.status(400).json({ error: 'No courses found. Add courses before generating.' });
    }

    let constraint = await Constraint.findOne({ userId: req.userId });
    if (!constraint) {
      constraint = await Constraint.create({ userId: req.userId });
    }

    const rooms = await Room.find({ userId: req.userId });
    const scheduler = new Scheduler(courses, constraint.toObject(), rooms);
    const result = scheduler.generate();

    // Detect conflicts in generated timetable
    const conflicts = ConflictDetector.detect(result.entries);
    result.stats.conflictCount = conflicts.length;

    // Save timetable (delete old ones for this user)
    await Timetable.deleteMany({ userId: req.userId });
    const timetable = await Timetable.create({ ...result, userId: req.userId });

    res.json({
      timetable,
      conflicts,
      suggestions:
        conflicts.length > 0
          ? ConflictDetector.suggest(conflicts, result.entries, constraint.toObject())
          : [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET latest timetable
router.get('/', async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    if (!timetable) {
      return res.json({ timetable: null, conflicts: [], suggestions: [] });
    }

    let constraint = await Constraint.findOne({ userId: req.userId });
    if (!constraint) {
      constraint = await Constraint.create({ userId: req.userId });
    }

    const conflicts = ConflictDetector.detect(timetable.entries);
    const suggestions =
      conflicts.length > 0
        ? ConflictDetector.suggest(conflicts, timetable.entries, constraint.toObject())
        : [];

    res.json({ timetable, conflicts, suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET conflicts for current timetable
router.get('/conflicts', async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    if (!timetable) {
      return res.json({ conflicts: [], suggestions: [] });
    }

    let constraint = await Constraint.findOne({ userId: req.userId });
    if (!constraint) {
      constraint = await Constraint.create({ userId: req.userId });
    }

    const conflicts = ConflictDetector.detect(timetable.entries);
    const suggestions = ConflictDetector.suggest(
      conflicts,
      timetable.entries,
      constraint.toObject()
    );

    res.json({ conflicts, suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
