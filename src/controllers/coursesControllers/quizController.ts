import { Request, Response } from "express";
import mongoose from "mongoose";
import Quiz from "../../models/Quiz";
import Course from "../../models/Course";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";

// Create a quiz for a course
export const createQuiz = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId, title, description, questions, duration, passingScore } = req.body;
    const instructorId = req.user?._id as mongoose.Types.ObjectId; // Assumes authenticated instructor

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      res.status(400).json({ message: "Invalid courseId" });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    if (!course.instructor?.equals(instructorId)) {
      res.status(403).json({ message: "You are not authorized to add a quiz to this course" });
      return;
    }

    const newQuiz = new Quiz({
      title,
      description,
      course: courseId,
      questions,
      createdBy: instructorId,
      duration,
      passingScore,
    });

    const savedQuiz = await newQuiz.save();

    // Add quiz to the course
    course.quizzes = [...(course.quizzes as mongoose.Types.ObjectId[] || []), savedQuiz._id as mongoose.Types.ObjectId];
    await course.save();

    res.status(201).json({ message: "Quiz created successfully", quiz: savedQuiz });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Delete a quiz
export const deleteQuiz = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const instructorId = req.user?._id as mongoose.Types.ObjectId; // Assumes authenticated instructor

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      res.status(400).json({ message: "Invalid quizId" });
      return;
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    if (!quiz.createdBy.equals(instructorId)) {
      res.status(403).json({ message: "You are not authorized to delete this quiz" });
      return;
    }

    await Quiz.findByIdAndDelete(quizId);

    // Remove quiz from the course
    const course = await Course.findById(quiz.course as mongoose.Types.ObjectId);
    if (course) {
      course.quizzes = course.quizzes?.filter((q) => !q.equals(quiz._id as mongoose.Types.ObjectId)) || [];
      await course.save();
    }

    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Update a quiz
export const updateQuiz = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { quizId } = req.params;
      const { title, description, questions, duration, passingScore } = req.body;
      const instructorId = req.user?._id as mongoose.Types.ObjectId; // Assumes authenticated instructor
  
      if (!mongoose.Types.ObjectId.isValid(quizId)) {
        res.status(400).json({ message: "Invalid quizId" });
        return;
      }
  
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        res.status(404).json({ message: "Quiz not found" });
        return;
      }
  
      if (!quiz.createdBy.equals(instructorId)) {
        res.status(403).json({ message: "You are not authorized to update this quiz" });
        return;
      }
  
      // Update quiz details
      if (title !== undefined) quiz.title = title;
      if (description !== undefined) quiz.description = description;
      if (questions !== undefined) quiz.questions = questions;
      if (duration !== undefined) quiz.duration = duration;
      if (passingScore !== undefined) quiz.passingScore = passingScore;
  
      const updatedQuiz = await quiz.save();
  
      res.status(200).json({ message: "Quiz updated successfully", quiz: updatedQuiz });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
  