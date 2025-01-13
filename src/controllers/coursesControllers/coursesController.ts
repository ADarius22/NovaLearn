import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Course from '../../models/Course';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';



// Get all courses
export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get course by ID
export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Update course progress
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

// Delete a course 
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

// Create a new course 
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

  // Update an existing course
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