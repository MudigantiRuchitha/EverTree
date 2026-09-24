const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDB, isPgConnected, query, fallbackData } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const chatRoutes = require('./routes/chatRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Enable CORS for frontend Vite app
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        app: 'Evertree Property Connect API',
        database: isPgConnected() ? 'PostgreSQL Connected' : 'In-Memory Resilient Engine Active',
        timestamp: new Date()
    });
});

// Socket.IO Real-time Chat Engine
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Track online users: userId -> socketId
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log(`⚡ Socket client connected: ${socket.id}`);

    // User joins with their ID
    socket.on('join_user', (userId) => {
        if (userId) {
            onlineUsers.set(Number(userId), socket.id);
            socket.userId = Number(userId);
            io.emit('user_status', { userId: Number(userId), status: 'online' });
            console.log(`👤 User ${userId} registered on socket ${socket.id}`);
        }
    });

    // Send Real-time message
    socket.on('send_message', async (data) => {
        const { sender_id, receiver_id, property_id, message, media_url, media_type } = data;
        const msgType = media_type || 'text';
        const timestamp = new Date();

        let savedMsg = {
            sender_id: Number(sender_id),
            receiver_id: Number(receiver_id),
            property_id: property_id ? Number(property_id) : null,
            message: message || '',
            media_url: media_url || null,
            media_type: msgType,
            is_read: false,
            created_at: timestamp
        };

        if (isPgConnected()) {
            try {
                const res = await query(
                    `INSERT INTO chat_messages (sender_id, receiver_id, property_id, message, media_url, media_type, is_read)
                     VALUES ($1, $2, $3, $4, $5, $6, FALSE) RETURNING *`,
                    [sender_id, receiver_id, property_id || null, message || '', media_url || null, msgType]
                );
                savedMsg = res.rows[0];
            } catch (err) {
                console.error('Socket DB insert error:', err);
            }
        } else {
            savedMsg.id = fallbackData.chat_messages.length + 1;
            fallbackData.chat_messages.push(savedMsg);
        }

        // Deliver message to receiver if online
        const receiverSocketId = onlineUsers.get(Number(receiver_id));
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('receive_message', savedMsg);
        }
        // Send confirmation back to sender
        socket.emit('message_sent', savedMsg);
    });

    // Mark messages as read (Read receipts)
    socket.on('mark_read', async ({ sender_id, receiver_id }) => {
        if (isPgConnected()) {
            await query('UPDATE chat_messages SET is_read = TRUE WHERE sender_id = $1 AND receiver_id = $2', [sender_id, receiver_id]);
        } else {
            fallbackData.chat_messages.forEach(m => {
                if (m.sender_id === Number(sender_id) && m.receiver_id === Number(receiver_id)) {
                    m.is_read = true;
                }
            });
        }

        const senderSocketId = onlineUsers.get(Number(sender_id));
        if (senderSocketId) {
            io.to(senderSocketId).emit('messages_read_receipt', { readerId: Number(receiver_id) });
        }
    });

    socket.on('disconnect', () => {
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            io.emit('user_status', { userId: socket.userId, status: 'offline' });
        }
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;

// Initialize database connection & launch server
initDB().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Evertree Backend Server running on http://localhost:${PORT}`);
    });
});
