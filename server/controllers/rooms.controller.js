import Room from '../models/room.model.js';

// GET all rooms for current user
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ userId: req.userId }).sort({ name: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create room
export const createRoom = async (req, res) => {
  try {
    const room = await Room.create({ ...req.body, userId: req.userId });
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT update room
export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE room
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
