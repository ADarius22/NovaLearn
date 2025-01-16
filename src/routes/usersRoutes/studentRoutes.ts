import { Router } from 'express';
import * as studentController from '../../controllers/usersControllers/studentController';
import { authenticate } from '../../middleware/authMiddleware';
import { takeQuiz, getQuizResults } from '../../controllers/usersControllers/studentController';
const router = Router();


router.use(authenticate); // Authentication middleware


router.post('/courses/:courseId/enroll', studentController.enrollInCourse);
router.post('/courses/:courseId/reviews', studentController.addCourseReview);

// Route for taking a quiz
router.post('/quiz/:quizId/take', authenticate, takeQuiz);

// Route for viewing quiz details or results
router.get('/quiz/:quizId', authenticate, getQuizResults);

export default router;