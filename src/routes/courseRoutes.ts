import { Router } from 'express';
import * as courseController from '../controllers/courseController';
import * as authMiddleware from '../middleware/authMiddleware';

const router = Router();

// Get all courses
router.get('/', authMiddleware.authenticate, courseController.getCourses);

// Get a specific course by ID
router.get('/:courseId', authMiddleware.authenticate, courseController.getCourseById);

// Create a new course 
router.post('/', authMiddleware.authenticate, authMiddleware.authorizeAdmin(), authMiddleware.authorizeInstructor(), courseController.createCourse);

// Update an existing course 
router.put('/:courseId', authMiddleware.authenticate, authMiddleware.authorizeAdmin(), authMiddleware.authorizeInstructor() ,courseController.updateCourse);

// Delete a course 
router.delete('/:courseId', authMiddleware.authenticate, authMiddleware.authorizeAdmin(), authMiddleware.authorizeInstructor(), courseController.deleteCourse);

// Enroll in a course
router.post('/:courseId/enroll', authMiddleware.authenticate, courseController.enrollInCourse);

// Add a review to a course
router.post('/:courseId/review', authMiddleware.authenticate, courseController.addCourseReview);

// Upload course materials admin instructor
router.post('/:courseId/materials', authMiddleware.authenticate, authMiddleware.authorizeAdmin(),  authMiddleware.authorizeInstructor(),  courseController.uploadCourseMaterial);


export default router;
