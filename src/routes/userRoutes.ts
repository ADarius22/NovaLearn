// userRoutes.ts
import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/login', userController.login);
router.post('/register', userController.registerUser);

// Protected routes (Users only)
router.use(authenticate); // Authentication middleware
router.get('/courses', userController.getCourses);
router.post('/courses/:courseId/enroll', userController.enrollInCourse);
router.post('/courses/:courseId/reviews', userController.addCourseReview);
router.put('/courses/:courseId/progress', userController.updateCourseProgress);

export default router;
