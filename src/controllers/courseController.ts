import { Request, Response } from 'express';
import Course from '../models/Course';
import mongoose from "mongoose";

export const getCourses = async (req: Request, res: Response) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error});
  }
};

// Create a new course
export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, duration, createdBy } = req.body;

    const newCourse = new Course({ title, description, duration, createdBy });
    const savedCourse = await newCourse.save();

    res.status(201).json(savedCourse);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Get a specific course by ID
export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Update an existing course
export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const updatedCourse = await Course.findByIdAndUpdate(courseId, req.body, { new: true });

    if (!updatedCourse) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Delete a course
export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const searchCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { keyword, category, difficulty } = req.query;

    const query: any = {};
    if (keyword) query.title = { $regex: keyword, $options: "i" }; // Case-insensitive search
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const courses = await Course.find(query);
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getCoursesWithPagination = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const courses = await Course.find()
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const totalCourses = await Course.countDocuments();

    res.status(200).json({
      data: courses,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCourses / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const enrollInCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = (req as any).user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    if (course.participants?.includes(userId)) {
      res.status(400).json({ message: "User already enrolled in this course" });
      return;
    }

    course.participants = [...(course.participants || []), userId];
    await course.save();

    res.status(200).json({ message: "Successfully enrolled in course" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const uploadCourseMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    // Add the file path to the materials array
    course.materials = [...(course.materials || []), req.file.path];
    await course.save();

    res.status(200).json({ message: "Material uploaded successfully", materials: course.materials });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const addCourseReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const userId = (req as any).user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
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

    res.status(201).json({ message: "Review added successfully", reviews: course.reviews });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateCourseProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { lessonId } = req.body;
    const userId = (req as any).user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    const progress = course.progress?.[userId] || [];
    if (progress.includes(lessonId)) {
      res.status(400).json({ message: "Lesson already completed" });
      return;
    }

    course.progress = {
      ...(course.progress || {}),
      [userId]: [...progress, lessonId],
    };

    await course.save();
    res.status(200).json({ message: "Progress updated", progress: course.progress[userId] });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};