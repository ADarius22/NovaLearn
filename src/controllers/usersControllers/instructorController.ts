import { Request, Response } from 'express';
import Course from '../../models/Course';
import { AuthenticatedRequest } from '../../middleware/authMiddleware'; // Ensures proper typing for authenticated requests


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
