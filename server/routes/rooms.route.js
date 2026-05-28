import express from 'express';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../controllers/rooms.controller.js';
import auth from '../middleware/auth.middleware.js';

const roomsRouter = express.Router();

roomsRouter.get('/', auth, getRooms);
roomsRouter.post('/', auth, createRoom);
roomsRouter.put('/:id', auth, updateRoom);
roomsRouter.delete('/:id', auth, deleteRoom);

export default roomsRouter;
