import { Request, Response } from 'express';
import Course from '../models/Course';
import { AuthenticatedRequest } from '../middleware/authMiddleware'; // Ensures proper typing for authenticated requests

// Create a new course (Instructors only)
export const createCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, duration, category } = req.body;

    if (req.user?.role !== 'instructor') {
      res.status(403).json({ message: 'Only instructors can create courses' });
      return;
    }

    const createdBy = req.user._id;

    const newCourse = new Course({ title, description, duration, category, createdBy });
    const savedCourse = await newCourse.save();

    res.status(201).json(savedCourse);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Update an existing course (Instructors only)
export const updateCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (req.user?.role !== 'instructor') {
      res.status(403).json({ message: 'Only instructors can update courses' });
      return;
    }

    const instructorId = req.user._id;

    const course = await Course.findOne({ _id: courseId, createdBy: instructorId });

    if (!course) {
      res.status(404).json({ message: 'Course not found or not owned by you' });
      return;
    }

    Object.assign(course, req.body);
    const updatedCourse = await course.save();

    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Delete a course (Instructors only)
export const deleteCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (req.user?.role !== 'instructor') {
      res.status(403).json({ message: 'Only instructors can delete courses' });
      return;
    }

    const instructorId = req.user._id;

    const course = await Course.findOneAndDelete({ _id: courseId, createdBy: instructorId });

    if (!course) {
      res.status(404).json({ message: 'Course not found or not owned by you' });
      return;
    }

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Upload course materials (Instructors only)
export const uploadCourseMaterial = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (req.user?.role !== 'instructor') {
      res.status(403).json({ message: 'Only instructors can upload materials' });
      return;
    }

    const instructorId = req.user._id;

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const course = await Course.findOne({ _id: courseId, createdBy: instructorId });
    if (!course) {
      res.status(404).json({ message: 'Course not found or not owned by you' });
      return;
    }

    // Add the file path to the materials array
    course.materials = [...(course.materials || []), req.file.path];
    await course.save();

    res.status(200).json({ message: 'Material uploaded successfully', materials: course.materials });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
