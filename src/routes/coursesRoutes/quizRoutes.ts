import { Router } from 'express';
import * as quizController from '../../controllers/coursesControllers/quizController';
import { authenticate, authorizeInstructor } from '../../middleware/authMiddleware';

const router = Router();

// Authentication middleware
router.use(authenticate);

// Quiz management routes
router.post('/create', authorizeInstructor(), quizController.createQuiz);
router.put('/update/:quizId', authorizeInstructor(), quizController.updateQuiz);
router.delete('/delete/:quizId', authorizeInstructor(), quizController.deleteQuiz);

export default router;
