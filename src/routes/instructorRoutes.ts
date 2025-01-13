// instructorRoutes.ts
import { Router } from 'express';
import * as instructorController from '../controllers/instructorController';
import { authenticate, authorizeInstructor } from '../middleware/authMiddleware';

const router = Router();

// Protected routes (Instructors only)
router.use(authenticate, authorizeInstructor()); // Call authorizeInstructor here

router.post('/courses', instructorController.createCourse);
router.put('/courses/:courseId', instructorController.updateCourse);
router.delete('/courses/:courseId', instructorController.deleteCourse);
router.post('/courses/:courseId/materials', instructorController.uploadCourseMaterial);

export default router;
