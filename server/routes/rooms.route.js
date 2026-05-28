import express from 'express';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../controllers/rooms.controller.js';

const roomsRouter = express.Router();

roomsRouter.get('/', getRooms);
roomsRouter.post('/', createRoom);
roomsRouter.put('/:id', updateRoom);
roomsRouter.delete('/:id', deleteRoom);

export default roomsRouter;
