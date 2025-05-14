import { Router } from 'express';
import {
  createQuiz,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  listMyQuizzes,
} from '../../controllers/courseControllers/quizController';
import { authenticate, authorizeInstructor } from '../../middleware/authMiddleware';
import { validateQuiz } from '../../middleware/validate'; // Optional validation middleware

const router = Router();

// All routes below require authentication
router.use(authenticate);

// Public Routes (for everyone to view)
router.get('/:idOrSlug', getQuiz); // Get quiz by ID or slug

// Instructor-only routes (to be used by instructors only)
router.use(authorizeInstructor);  // Middleware to ensure the user is an instructor

// Create a new quiz (Instructor-only)
router.post('/', validateQuiz, async (req, res) => {
  await createQuiz(req, res);
});

// Update an existing quiz (Instructor-only)
router.patch('/:id', validateQuiz, async (req, res) => {
  await updateQuiz(req, res);
});

// Delete a quiz (Instructor-only)
router.delete('/:id', async (req, res) => {
  await deleteQuiz(req, res);
});

// List all quizzes created by the instructor
router.get('/my-quizzes', async (req, res) => {
  await listMyQuizzes(req, res);
});

export default router;
