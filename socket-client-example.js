/**
 * Socket.IO Client Example for Chat Application
 * 
 * This example shows how to connect to the server and use all Socket.IO features:
 * - Join/Leave rooms
 * - Send and receive messages
 * - Typing indicator
 * - Message delivery & seen status
 * - User online/offline status
 */

import io from 'socket.io-client';

// Connect to server
const socket = io('http://localhost:3000', {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
});

// User data
const userId = 'user123'; // Replace with actual user ID from login
const userName = 'John Doe'; // Replace with actual user name
const currentRoom = 'room-456'; // The chat room ID

// ============ Connection Events ============
socket.on('connect', () => {
    console.log('Connected to server:', socket.id);
    
    // User comes online
    socket.emit('user-online', userId);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

// ============ Room Management ============
function joinRoom(roomId) {
    socket.emit('join-room', { roomId, userId });
    console.log(`Joined room: ${roomId}`);
}

function leaveRoom(roomId) {
    socket.emit('leave-room', { roomId, userId });
    console.log(`Left room: ${roomId}`);
}

// Listen for user joined
socket.on('user-joined', (data) => {
    console.log(`${data.userId} joined ${data.roomId}`);
    // Update UI to show user joined
});

socket.on('user-left', (data) => {
    console.log(`${data.userId} left ${data.roomId}`);
    // Update UI to show user left
});

// ============ Typing Indicator ============
function startTyping(roomId) {
    socket.emit('typing', { roomId, userId });
}

// Listen for typing indicator
socket.on('user-typing', (data) => {
    console.log(`${data.userId} is typing in ${data.roomId}`);
    // Show "User is typing..." in UI
});

socket.on('user-stop-typing', (data) => {
    console.log(`${data.userId} stopped typing in ${data.roomId}`);
    // Remove typing indicator from UI
});

// ============ Send Message ============
function sendMessage(roomId, text) {
    socket.emit('send-message', {
        roomId,
        userId,
        userName,
        text,
    });
}

// Receive messages
socket.on('receive-message', (data) => {
    console.log('New message:', data);
    // Format: { _id, senderId, userName, roomId, text, delivered, seen, createdAt }
    // Add message to chat history in UI
    // Structure: { _id, senderId, userName, text, createdAt, delivered: true, seen: false }
});

// Confirmation that message was sent
socket.on('message-sent', (data) => {
    console.log('Message sent successfully:', data._id);
    // Update UI to show message sent with ID data._id
});

socket.on('message-error', (data) => {
    console.error('Failed to send message:', data.error);
});

// ============ Message Delivery Status ============
function markMessageAsDelivered(messageId, roomId) {
    socket.emit('mark-delivered', { messageId, roomId });
}

socket.on('message-delivered', (data) => {
    console.log('Message delivered:', data.messageId);
    // Update UI to show delivery tick
});

// ============ Message Seen Status ============
function markMessageAsSeen(messageId, roomId) {
    socket.emit('mark-seen', { messageId, roomId });
}

socket.on('message-seen', (data) => {
    console.log('Message seen:', data.messageId);
    // Update UI to show double tick (seen)
});

// ============ User Status ============
socket.on('user-status', (data) => {
    console.log(`User ${data.userId} is ${data.status}`);
    // Update online/offline indicator in UI
});

// ============ REST API Endpoints ============

/**
 * Get all messages in a room (for initial load)
 * GET /api/messages/room/{roomId}
 */
async function fetchRoomMessages(roomId) {
    try {
        const response = await fetch(`http://localhost:3000/api/messages/room/${roomId}`);
        const messages = await response.json();
        console.log('Messages loaded:', messages);
        return messages;
    } catch (err) {
        console.error('Error fetching messages:', err);
    }
}

/**
 * Get unread messages for current user
 * GET /api/messages/unread/{userId}
 */
async function fetchUnreadMessages(userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/messages/unread/${userId}`);
        const messages = await response.json();
        console.log('Unread messages:', messages);
        return messages;
    } catch (err) {
        console.error('Error fetching unread messages:', err);
    }
}

/**
 * Mark all messages in a room as read
 * PUT /api/messages/mark-read
 */
async function markRoomAsRead(roomId, userId) {
    try {
        const response = await fetch('http://localhost:3000/api/messages/mark-read', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, userId }),
        });
        const result = await response.json();
        console.log(result);
    } catch (err) {
        console.error('Error marking room as read:', err);
    }
}

/**
 * Delete a message
 * DELETE /api/messages/{messageId}
 */
async function deleteMessage(messageId) {
    try {
        const response = await fetch(`http://localhost:3000/api/messages/${messageId}`, {
            method: 'DELETE',
        });
        const result = await response.json();
        console.log(result);
    } catch (err) {
        console.error('Error deleting message:', err);
    }
}

// ============ Usage Example ============
// Join a room when component mounts
joinRoom(currentRoom);

// Load initial messages
await fetchRoomMessages(currentRoom);

// Listen for incoming messages and mark as delivered
socket.on('receive-message', (message) => {
    // Auto-mark as delivered after 500ms
    setTimeout(() => {
        markMessageAsDelivered(message._id, currentRoom);
    }, 500);
});

// Export functions for use in UI
export {
    socket,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    markMessageAsDelivered,
    markMessageAsSeen,
    fetchRoomMessages,
    fetchUnreadMessages,
    markRoomAsRead,
    deleteMessage,
};
