import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { SessionController } from '../controllers/session.controller';
import { TeacherController } from '../controllers/teacher.controller';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

const authController = new AuthController();
const sessionController = new SessionController();
const teacherController = new TeacherController();
const userController = new UserController();

router.post('/api/auth/login', authController.login);
router.post('/api/auth/register', authController.register);

router.get('/api/user/:id', authMiddleware, userController.getById);
router.delete('/api/user/:id', authMiddleware, userController.delete);
router.post('/api/user/promote-admin', authMiddleware, userController.promoteSelfToAdmin);


router.get('/api/teacher', authMiddleware, teacherController.getAll);
router.get('/api/teacher/:id', authMiddleware, teacherController.getById);


router.get('/api/session', authMiddleware, sessionController.getAll);
router.get('/api/session/:id', authMiddleware, sessionController.getById);
router.post('/api/session', authMiddleware, sessionController.create);
router.put('/api/session/:id', authMiddleware, sessionController.update);
router.delete('/api/session/:id', authMiddleware, sessionController.delete);


router.post('/api/session/:id/participate/:userId', authMiddleware, sessionController.participate);
router.delete('/api/session/:id/participate/:userId', authMiddleware, sessionController.unparticipate);

export default router;