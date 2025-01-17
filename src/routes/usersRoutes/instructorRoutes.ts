import { Router } from 'express';
import * as instructorController from '../../controllers/usersControllers/instructorController';
import { authenticate, authorizeAdmin, authorizeInstructor } from '../../middleware/authMiddleware';

const router = Router();

// Public route for instructor registration
router.post('/register', instructorController.registerInstructor);

// Protected routes (Instructors and Admins only)
router.use(authenticate, authorizeInstructor(), authorizeAdmin());

// Instructors and Admins can access these routes
router.post('/courses/:courseId/materials', instructorController.uploadCourseMaterial);

// Add more instructor-specific or admin-accessible routes here

export default router;
