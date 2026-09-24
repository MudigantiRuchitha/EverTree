const { query, isPgConnected, fallbackData } = require('../config/db');

exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        if (isPgConnected()) {
            const sql = `
                SELECT DISTINCT ON (partner_id) 
                    partner_id,
                    u.name as partner_name,
                    u.role as partner_role,
                    u.avatar_url as partner_avatar,
                    c.message as last_message,
                    c.media_type,
                    c.created_at,
                    c.is_read
                FROM (
                    SELECT sender_id as partner_id, id FROM chat_messages WHERE receiver_id = $1
                    UNION
                    SELECT receiver_id as partner_id, id FROM chat_messages WHERE sender_id = $1
                ) sub
                JOIN chat_messages c ON c.id = sub.id
                JOIN users u ON u.id = sub.partner_id
                ORDER BY partner_id, c.id DESC
            `;
            const result = await query(sql, [userId]);
            return res.json(result.rows);
        } else {
            const conversationsMap = new Map();
            fallbackData.chat_messages.forEach(m => {
                let partnerId = null;
                if (m.sender_id === userId) partnerId = m.receiver_id;
                else if (m.receiver_id === userId) partnerId = m.sender_id;

                if (partnerId) {
                    const partner = fallbackData.users.find(u => u.id === partnerId) || { name: 'User ' + partnerId, role: 'seller' };
                    if (!conversationsMap.has(partnerId) || conversationsMap.get(partnerId).id < m.id) {
                        conversationsMap.set(partnerId, {
                            partner_id: partnerId,
                            partner_name: partner.name,
                            partner_role: partner.role,
                            partner_avatar: partner.avatar_url,
                            last_message: m.message || (m.media_type === 'image' ? '📷 Image' : '📎 Attachment'),
                            media_type: m.media_type,
                            created_at: m.created_at,
                            is_read: m.is_read
                        });
                    }
                }
            });
            return res.json(Array.from(conversationsMap.values()));
        }
    } catch (err) {
        console.error('getConversations error:', err);
        res.status(500).json({ error: 'Failed to fetch chat conversations.' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { partner_id } = req.params;
        const partnerId = Number(partner_id);

        if (isPgConnected()) {
            const result = await query(
                `SELECT c.*, u1.name as sender_name, u2.name as receiver_name 
                 FROM chat_messages c
                 JOIN users u1 ON c.sender_id = u1.id
                 JOIN users u2 ON c.receiver_id = u2.id
                 WHERE (c.sender_id = $1 AND c.receiver_id = $2)
                    OR (c.sender_id = $2 AND c.receiver_id = $1)
                 ORDER BY c.id ASC`,
                [userId, partnerId]
            );
            return res.json(result.rows);
        } else {
            const msgs = fallbackData.chat_messages.filter(m =>
                (m.sender_id === userId && m.receiver_id === partnerId) ||
                (m.sender_id === partnerId && m.receiver_id === userId)
            ).map(m => {
                const s = fallbackData.users.find(u => u.id === m.sender_id) || {};
                const r = fallbackData.users.find(u => u.id === m.receiver_id) || {};
                return { ...m, sender_name: s.name, receiver_name: r.name };
            });
            return res.json(msgs);
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages.' });
    }
};

exports.uploadChatAttachment = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }
        const fileUrl = `/uploads/properties/${req.file.filename}`;
        let mediaType = 'file';
        if (req.file.mimetype.includes('image')) mediaType = 'image';
        else if (req.file.mimetype.includes('audio')) mediaType = 'voice';

        return res.json({ file_url: fileUrl, media_type: mediaType });
    } catch (err) {
        res.status(500).json({ error: 'Failed to upload chat file.' });
    }
};
exports.getAdminConversations = async (req, res) => {
    try {
        if (isPgConnected()) {
            const result = await query(`
                SELECT DISTINCT ON (conversation_key)
                    conversation_key,
                    sender_id,
                    receiver_id,
                    sender_name,
                    receiver_name,
                    last_message,
                    media_type,
                    created_at
                FROM (
                    SELECT
                        LEAST(c.sender_id, c.receiver_id) || '-' ||
                        GREATEST(c.sender_id, c.receiver_id) AS conversation_key,
                        c.sender_id,
                        c.receiver_id,
                        u1.name AS sender_name,
                        u2.name AS receiver_name,
                        c.message AS last_message,
                        c.media_type,
                        c.created_at,
                        c.id
                    FROM chat_messages c
                    JOIN users u1 ON c.sender_id = u1.id
                    JOIN users u2 ON c.receiver_id = u2.id
                ) conversations
                ORDER BY conversation_key, created_at DESC
            `);

            return res.json(result.rows);
        }

        return res.json([]);
    } catch (err) {
        console.error("getAdminConversations error:", err);

        res.status(500).json({
            error: "Failed to fetch admin conversations."
        });
    }
};
exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;

        const {
            receiver_id,
            message,
            media_url,
            media_type = "text"
        } = req.body;

        if (!receiver_id) {
            return res.status(400).json({
                error: "Receiver is required."
            });
        }

        const receiverId = Number(receiver_id);

        if (!Number.isInteger(receiverId)) {
            return res.status(400).json({
                error: "Invalid receiver."
            });
        }

        if (senderId === receiverId) {
            return res.status(400).json({
                error: "You cannot send a message to yourself."
            });
        }

        if (media_type === "text" && (!message || !message.trim())) {
            return res.status(400).json({
                error: "Message cannot be empty."
            });
        }

        if (!isPgConnected()) {
            return res.status(503).json({
                error: "Database is not connected."
            });
        }

        const result = await query(
            `INSERT INTO chat_messages
                (sender_id, receiver_id, message, media_type, media_url)
             VALUES
                ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                senderId,
                receiverId,
                message ? message.trim() : "Voice Message",
                media_type,
                media_url || null
            ]
        );

        return res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error("sendMessage error:", err);

        return res.status(500).json({
            error: "Failed to send message."
        });
    }
};