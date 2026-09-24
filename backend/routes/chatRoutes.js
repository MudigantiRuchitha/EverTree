const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/conversations', verifyToken, chatController.getConversations);


router.get(
    '/admin/conversations',
    verifyToken,
    requireRole('admin'),
    chatController.getAdminConversations
);
router.get('/messages/:partner_id', verifyToken, chatController.getMessages);
router.post('/upload', verifyToken, upload.single('file'), chatController.uploadChatAttachment);
router.post('/messages', verifyToken, chatController.sendMessage);
module.exports = router;
