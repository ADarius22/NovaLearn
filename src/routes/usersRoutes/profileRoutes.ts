import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
} from '../../controllers/usersControllers/profileController';

import { authenticate } from '../../middleware/authMiddleware';

const router = Router();


router.use(authenticate);
router.get('/me', getMyProfile);
router.patch('/me', updateMyProfile);

export default router;
