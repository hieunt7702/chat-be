import { Server } from 'socket.io';
import Message from './models/Message.js';
import User from './models/User.js';

export const initializeSocket = (httpServer) => {
    console.log("intiDLSKJ")
    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    // Store active users and their sockets
    const activeUsers = new Map(); // userId -> { socketId, rooms }
    const typingUsers = new Map(); // roomId -> Set of userIds typing

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // User joins the app
        socket.on('user-online', (userId) => {
            console.log(`${userId}`);
            activeUsers.set(userId, { socketId: socket.id, rooms: new Set() });
            io.emit('user-status', { userId, status: 'online' });
            console.log(`User ${userId} is online`);
        });

        // User joins a room (chat)
        socket.on('join-room', (data) => {
            const { roomId, userId } = data;
            socket.join(roomId);

            if (activeUsers.has(userId)) {
                const user = activeUsers.get(userId);
                user.rooms.add(roomId);
            }

            // Notify others in the room that user joined
            socket.to(roomId).emit('user-joined', { userId, roomId });
            console.log(`User ${userId} joined room ${roomId}`);
        });

        // User leaves a room
        socket.on('leave-room', (data) => {
            const { roomId, userId } = data;
            socket.leave(roomId);

            if (activeUsers.has(userId)) {
                const user = activeUsers.get(userId);
                user.rooms.delete(roomId);
            }

            socket.to(roomId).emit('user-left', { userId, roomId });
            console.log(`User ${userId} left room ${roomId}`);
        });

        // Typing indicator
        socket.on('typing', (data) => {
            const { roomId, userId } = data;

            console.log(`User ${userId} is typing in room ${roomId}`);
            if (!typingUsers.has(roomId)) {
                typingUsers.set(roomId, new Set());
            }
            console.log(`User2 ${userId} is typing in room ${roomId}`);

            typingUsers.get(roomId).add(userId);

            // Broadcast typing status to room
            socket.to(roomId).emit('user-typing', { userId, roomId });

            // Auto-remove typing status after 3 seconds of inactivity
            setTimeout(() => {
                const room = typingUsers.get(roomId);
                if (room) {
                    room.delete(userId);
                    if (room.size === 0) {
                        typingUsers.delete(roomId);
                    }
                }
                socket.to(roomId).emit('user-stop-typing', { userId, roomId });
            }, 3000);
        });

        // Send message with DB persistence
        socket.on('send-message', async (data) => {
            try {
                const { roomId, userId, text, userName } = data;

                // Save message to database
                const message = await Message.create({
                    senderId: userId,
                    roomId,
                    text,
                });

                // Broadcast message to room with delivery status
                socket.to(roomId).emit('receive-message', {
                    _id: message._id,
                    senderId: userId,
                    userName,
                    roomId,
                    text,
                    delivered: true,
                    seen: false,
                    createdAt: message.createdAt,
                });

                // Send confirmation back to sender
                socket.emit('message-sent', {
                    _id: message._id,
                    status: 'sent',
                });

                console.log(`Message saved from ${userId} in room ${roomId}`);
            } catch (err) {
                console.error('Error saving message:', err.message);
                socket.emit('message-error', { error: 'Failed to send message' });
            }
        });

        // Mark message as delivered
        socket.on('mark-delivered', async (data) => {
            try {
                const { messageId, roomId } = data;

                await Message.findByIdAndUpdate(messageId, { delivered: true });

                socket.to(roomId).emit('message-delivered', { messageId });
                console.log(`Message ${messageId} marked as delivered`);
            } catch (err) {
                console.error('Error marking delivered:', err.message);
            }
        });

        // Mark message as seen
        socket.on('mark-seen', async (data) => {
            try {
                const { messageId, roomId } = data;

                await Message.findByIdAndUpdate(messageId, { seen: true });

                socket.to(roomId).emit('message-seen', { messageId });
                console.log(`Message ${messageId} marked as seen`);
            } catch (err) {
                console.error('Error marking seen:', err.message);
            }
        });

        // User goes offline
        socket.on('disconnect', () => {
            let userId;

            // Find and remove user from active users
            for (const [uid, userData] of activeUsers.entries()) {
                if (userData.socketId === socket.id) {
                    userId = uid;
                    activeUsers.delete(uid);
                    break;
                }
            }

            if (userId) {
                io.emit('user-status', { userId, status: 'offline' });
                console.log(`User ${userId} disconnected`);
            }
        });
    });

    return io;
};
