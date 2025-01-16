import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from '../../models/User';
import Course from '../../models/Course';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import Quiz from '../../models/Quiz';

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
// Take a quiz and submit answers
export const takeQuiz = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body; // Student's submitted answers
    const userId = req.user?._id as mongoose.Types.ObjectId;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      res.status(400).json({ message: 'Invalid quizId' });
      return;
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' });
      return;
    }

    let score = 0;
    const results: { question: string; correct: boolean }[] = [];

    quiz.questions.forEach((question, index) => {
      const correctAnswers = question.correctAnswers.sort().join(',');
      const studentAnswers = answers[index]?.sort().join(',');

      if (correctAnswers === studentAnswers) {
        score += question.points || 1; // Default to 1 point if not specified
        results.push({ question: question.text, correct: true });
      } else {
        results.push({ question: question.text, correct: false });
      }
    });

    const passed = score >= (quiz.passingScore || 0);

    res.status(200).json({
      message: passed ? 'Passed' : 'Failed',
      score,
      passingScore: quiz.passingScore,
      results,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// View quiz results (optional)
export const getQuizResults = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      res.status(400).json({ message: 'Invalid quizId' });
      return;
    }

    const quiz = await Quiz.findById(quizId).populate('course');
    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' });
      return;
    }

    res.status(200).json({ quiz });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};