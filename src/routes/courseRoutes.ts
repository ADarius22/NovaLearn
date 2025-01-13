import { Router } from 'express';
import * as courseController from '../controllers/courseController';
import * as authMiddleware from '../middleware/authMiddleware';

const router = Router();

// Get all courses
router.get('/', authMiddleware.authenticate, courseController.getCourses);

// Get a specific course by ID
router.get('/:courseId', authMiddleware.authenticate, courseController.getCourseById);

// Create a new course (Admin Only)
router.post('/', authMiddleware.authenticate, authMiddleware.authorizeAdmin(['admin']), courseController.createCourse);

// Update an existing course (Admin Only)
router.put('/:courseId', authMiddleware.authenticate, authMiddleware.authorizeAdmin(['admin']), courseController.updateCourse);

// Delete a course (Admin Only)
router.delete('/:courseId', authMiddleware.authenticate, authMiddleware.authorizeAdmin(['admin']), courseController.deleteCourse);

// Enroll in a course
router.post('/:courseId/enroll', authMiddleware.authenticate, courseController.enrollInCourse);

// Add a review to a course
router.post('/:courseId/review', authMiddleware.authenticate, courseController.addCourseReview);

// Upload course materials (Admin Only)
router.post('/:courseId/materials', authMiddleware.authenticate, authMiddleware.authorizeAdmin(['admin']), courseController.uploadCourseMaterial);

// Assign an instructor to a course (Admin Only)
router.put('/:courseId/instructor/:instructorId', authMiddleware.authenticate, authMiddleware.authorizeAdmin(['admin']), courseController.assignInstructor);

export default router;
