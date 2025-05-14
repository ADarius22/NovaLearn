import { Router } from 'express';
import {
  applyForInstructor,
  getApplicationStatus,
  listMyCoursesStats ,
} from '../../controllers/usersControllers/instructorController';
import {
  authenticate,
  authorizeStudent,
  authorizeInstructor,
  ensureApprovedInstructor,
} from '../../middleware/authMiddleware';

const router = Router();


router.post('/apply', authenticate, authorizeStudent, applyForInstructor);
router.get('/status', authenticate, authorizeInstructor, getApplicationStatus);
router.get('/dashboard/course-stats', authenticate, ensureApprovedInstructor, listMyCoursesStats);

export default router;
