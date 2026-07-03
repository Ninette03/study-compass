import { Router } from 'express';
import { messageController } from '../controllers/MessageController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/unread-count', (req, res, next) => messageController.unreadCount(req, res, next));
router.post('/conversations', (req, res, next) => messageController.startConversation(req, res, next));
router.get('/conversations', (req, res, next) => messageController.listConversations(req, res, next));
router.get('/conversations/:id', (req, res, next) => messageController.getConversation(req, res, next));
router.post('/conversations/:id/messages', (req, res, next) => messageController.sendMessage(req, res, next));

export default router;
