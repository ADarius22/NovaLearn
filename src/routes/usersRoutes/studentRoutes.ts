import { Router } from 'express';
import * as studentController from '../../controllers/usersControllers/studentController';
import { authenticate } from '../../middleware/authMiddleware';
const router = Router();


router.use(authenticate); // Authentication middleware


router.post('/courses/:courseId/enroll', studentController.enrollInCourse);
router.post('/courses/:courseId/reviews', studentController.addCourseReview);

export default router;