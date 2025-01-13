import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from '../../models/User';
import Course from '../../models/Course';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';


// Enroll in a course
export const enrollInCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.user?._id as mongoose.Types.ObjectId;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    if (course.participants?.includes(userId)) {
      res.status(400).json({ message: 'User already enrolled in this course' });
      return;
    }

    course.participants = [...(course.participants || []), userId];
    await course.save();

    res.status(200).json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Add a review to a course
export const addCourseReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?._id as mongoose.Types.ObjectId;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const review = {
      user: userId,
      rating,
      comment,
      createdAt: new Date(),
    };

    course.reviews = [...(course.reviews || []), review];
    await course.save();

    res.status(201).json({ message: 'Review added successfully', reviews: course.reviews });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
