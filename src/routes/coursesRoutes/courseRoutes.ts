import { Router } from 'express';
import {
  getPublicCourses,
  getCourseDetails,
  getInstructorCourses,
  createInstructorCourse,
  updateInstructorCourse,
  deleteInstructorCourse,
} from '../../controllers/courseControllers/courseController';
import { authenticate, authorizeInstructor } from '../../middleware/authMiddleware';

const router = Router();

// ─────────────────────────────────────────────────────────────────────
// Public Courses Routes
// ─────────────────────────────────────────────────────────────────────
router.get('/public', getPublicCourses);  // GET: /courses/public?search=...&category=...&page=...&limit=...&sort=...
router.get('/:id', getCourseDetails);     // GET: /courses/:id (either by ID or slug)

// ─────────────────────────────────────────────────────────────────────
// Instructor Routes (requires authentication and instructor role)
// ─────────────────────────────────────────────────────────────────────
router.use(authenticate, authorizeInstructor);

// GET: /courses/instructor/courses – List instructor’s courses
router.get('/instructor/courses', getInstructorCourses);

// POST: /courses/instructor/create – Create a new course
router.post('/instructor/create', createInstructorCourse);

// PATCH: /courses/instructor/update/:id – Update an instructor's course
router.patch('/instructor/update/:id', updateInstructorCourse);

// DELETE: /courses/instructor/delete/:id – Delete an instructor's course
router.delete('/instructor/delete/:id', deleteInstructorCourse);

export default router;
