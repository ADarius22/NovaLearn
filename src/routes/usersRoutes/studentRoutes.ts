import { Router } from 'express';
import {
  enrollInCourse,
  unenrollFromCourse,
  getEnrolledCourses,
  markLessonCompleted,
  submitQuizAttempt,
  getQuizAttempts,
} from '../../controllers/usersControllers/studentController';

import {
  authenticate,
  authorizeStudent,
} from '../../middleware/authMiddleware';

const router = Router();

// Student-only routes
router.use(authenticate, authorizeStudent);

// Enroll in a course
router.post('/enroll/:courseId', enrollInCourse);

// Unenroll from a course
router.delete('/unenroll/:courseId', unenrollFromCourse);

// List enrolled courses
router.get('/courses', getEnrolledCourses);

// Mark lesson as completed
router.patch('/progress/:courseId/:lessonId', markLessonCompleted);

// Submit quiz attempt
router.post('/attempt/:quizId', submitQuizAttempt);

// Get quiz attempt history
router.get('/attempts', getQuizAttempts);

export default router;
