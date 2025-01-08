import { Router } from 'express';
import * as userController from '../controllers/userController';
import * as authMiddleware from '../middleware/authMiddleware';

const router = Router();

router.get(
  '/profile',
  authMiddleware.authenticate,
  userController.getUserProfile
);
router.put(
  '/profile',
  authMiddleware.authenticate,
  userController.updateUserProfile
);
router.delete(
  '/profile',
  authMiddleware.authenticate,
  userController.deleteUserProfile
);
router.post('/logout', authMiddleware.authenticate, userController.logoutUser);
router.put(
  '/promoteToAdmin/:userId',
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin(['admin']),
  userController.promoteUserToAdmin
);

export default router;
