import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from '../models/User';
import Course from '../models/Course';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// Login for all roles
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Register as a general user
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role: 'user' });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get all courses
export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

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

export const updateCourseProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { lessonId } = req.body;

    // Ensure userId is valid
    const userId = req.user?._id?.toString();
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID is missing' });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Ensure the lessonId exists in the lessons array
    const lessonExists = course.lessons?.some(lesson => lesson.lessonId === lessonId);
    if (!lessonExists) {
      res.status(400).json({ message: 'Invalid lessonId' });
      return;
    }

    // Ensure progress is initialized as an object
    if (!course.progress) {
      course.progress = {};
    }

    // Retrieve user progress
    const userProgress = course.progress[userId] || [];
    if (userProgress.includes(lessonId)) {
      res.status(400).json({ message: 'Lesson already completed' });
      return;
    }

    // Add lessonId to user's progress
    userProgress.push(lessonId);
    course.progress[userId] = userProgress;

    // Save the updated course
    await course.save();

    res.status(200).json({ message: 'Progress updated', progress: course.progress[userId] });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
