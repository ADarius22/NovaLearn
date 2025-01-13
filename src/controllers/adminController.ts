import { Request, Response } from 'express';
import Admin from '../models/Admin'; // Admin model
import Instructor from '../models/Instructor'; // Instructor model
import User from '../models/User'; // User model
import Course from '../models/Course'; // Course model

// Approve or reject instructor applications
export const reviewInstructorApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { decision, reason } = req.body; // `decision` should be 'approved' or 'rejected'

    // Use the Instructor model for applications
    const instructor = await Instructor.findById(userId);
    if (!instructor) {
      res.status(404).json({ error: 'Instructor not found' });
      return;
    }

    if (decision === 'approved') {
      instructor.role = 'instructor';
      instructor.applicationStatus = 'approved';
    } else if (decision === 'rejected') {
      instructor.applicationStatus = 'rejected';
      instructor.documents = []; // Clear documents if rejected
    } else {
      res.status(400).json({ error: 'Invalid decision' });
      return;
    }

    await instructor.save();

    res.status(200).json({
      message: `Application ${decision} successfully`,
      instructor,
      reason: decision === 'rejected' ? reason : undefined,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get all users (Admin only)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find(); // Query all users from the User collection
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Delete a user (Admin only)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Delete from User collection
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'User deleted successfully', user });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Manage all courses (Admin only)
export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await Course.find(); // Query all courses
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    // Delete course by ID
    const course = await Course.findByIdAndDelete(courseId);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    res.status(200).json({ message: 'Course deleted successfully', course });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
