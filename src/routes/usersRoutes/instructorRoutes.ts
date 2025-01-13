// instructorRoutes.ts
import { Router } from 'express';
import * as instructorController from '../../controllers/usersControllers/instructorController';
import { authenticate, authorizeAdmin, authorizeInstructor } from '../../middleware/authMiddleware';

const router = Router();

// Protected routes (Instructors only)
router.use(authenticate, authorizeInstructor(), authorizeAdmin()); // Call authorizeInstructor here
router.post('/courses/:courseId/materials', instructorController.uploadCourseMaterial);

export default router;
