
import { Router } from 'express';
import * as courseController from '../../controllers/coursesControllers/coursesController';
import { authenticate } from '../../middleware/authMiddleware';

const router = Router();

router.use(authenticate); // Authentication middleware

router.get('/courses', courseController.getCourses);
router.delete('/courses/:courseId', courseController.deleteCourse);
router.put('/courses/:courseId/progress', courseController.updateCourseProgress);
router.get('/courses', courseController.getCourses);