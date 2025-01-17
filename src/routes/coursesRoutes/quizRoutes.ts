import { Router } from "express";
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizzesByCourseId,
} from "../../controllers/coursesControllers/quizController";
import { authenticate, authorizeInstructor } from "../../middleware/authMiddleware";

const router = Router();

// Authentication middleware is applied globally
router.use(authenticate);

// Quiz management routes
router.post("/create", authorizeInstructor(), createQuiz);
router.put("/update/:quizId", authorizeInstructor(), updateQuiz);
router.delete("/delete/:quizId", authorizeInstructor(), deleteQuiz);
router.get("/:courseId/quizzes", getQuizzesByCourseId);

export default router;
