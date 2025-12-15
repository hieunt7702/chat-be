import express from 'express';
import {
    getRoomMessages,
    getUnreadMessages,
    markRoomAsRead,
    deleteMessage,
} from '../controllers/message.controller.js';

const router = express.Router();

// Get all messages in a room
router.get('/room/:roomId', getRoomMessages);

// Get unread messages for a user
router.get('/unread/:userId', getUnreadMessages);

// Mark all messages in a room as read
router.put('/mark-read', markRoomAsRead);

// Delete a message
router.delete('/:messageId', deleteMessage);

export default router;
