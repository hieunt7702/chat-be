import Message from '../models/Message.js';
import User from '../models/User.js';

// Get all messages in a room
export const getRoomMessages = async (req, res) => {
    try {
        const { roomId } = req.params;

        const messages = await Message.find({ roomId })
            .populate('senderId', 'name email')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get unread messages for a user
export const getUnreadMessages = async (req, res) => {
    try {
        const { userId } = req.params;

        const unreadMessages = await Message.find({
            senderId: { $ne: userId },
            seen: false,
        })
            .populate('senderId', 'name email')
            .sort({ createdAt: -1 });

        res.json(unreadMessages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark all messages in a room as seen by a user
export const markRoomAsRead = async (req, res) => {
    try {
        const { roomId, userId } = req.body;

        // Update all messages in the room that weren't sent by the user
        await Message.updateMany(
            { roomId, senderId: { $ne: userId } },
            { seen: true }
        );

        res.json({ message: 'Room marked as read' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a message
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findByIdAndDelete(messageId);
        if (!message) return res.status(404).json({ message: 'Message not found' });

        res.json({ message: 'Message deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
