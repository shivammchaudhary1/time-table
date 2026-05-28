import Course from '../models/course.model.js';

// GET all courses for current user
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create course
export const createCourse = async (req, res) => {
  try {
    const course = await Course.create({ ...req.body, userId: req.userId });
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT update course
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE course
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
