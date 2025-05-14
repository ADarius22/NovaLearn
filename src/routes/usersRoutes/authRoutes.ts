import { Router } from 'express';
import {
  register,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
} from '../../controllers/usersControllers/authController';

import validate from '../../middleware/validate';
import { registerSchema, loginSchema, resetPasswordSchema } from '../../schemas/authSchema';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

export default router;
