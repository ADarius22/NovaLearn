// adminRoutes.ts
import { Router } from 'express';
import * as adminController from '../controllers/AdminController';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware';

const router = Router();

// Middleware to ensure only admins can access these routes
router.use(authenticate, authorizeAdmin());

// Review instructor applications
router.put('/instructors/:userId/review', adminController.reviewInstructorApplication);

// Manage users
router.get('/users', adminController.getAllUsers);
router.delete('/users/:userId', adminController.deleteUser);

// Manage courses
router.get('/courses', adminController.getAllCourses);
router.delete('/courses/:courseId', adminController.deleteCourse);

export default router;