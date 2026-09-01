const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/conversations', verifyToken, chatController.getConversations);
router.get('/messages/:partner_id', verifyToken, chatController.getMessages);
router.post('/upload', verifyToken, upload.single('file'), chatController.uploadChatAttachment);

module.exports = router;
