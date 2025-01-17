import { Request, Response } from "express";
import mongoose from "mongoose";
import Student from "../../models/Student";
import Course from "../../models/Course";
import Quiz from "../../models/Quiz";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import * as instructorService from "../../services/instructorService";



export const registerInstructor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, biography, expertise, documents } = req.body;

    const newInstructor = await instructorService.registerInstructor({
      name,
      email,
      password,
      biography,
      expertise,
      documents,
    });

    res.status(201).json({ message: "Instructor registered successfully", instructor: newInstructor });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};


// Enroll in a course
export const enrollInCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const courseId = new mongoose.Types.ObjectId(req.params.courseId);
    const studentId = req.user?._id as mongoose.Types.ObjectId;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    if (student.enrolledCourses && student.enrolledCourses.includes(courseId)) {
      res.status(400).json({ message: "Student already enrolled in this course" });
      return;
    }

    student.enrolledCourses = student.enrolledCourses || [];
    student.enrolledCourses.push(courseId);
    course.participants = [...(course.participants || []), studentId];

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await student.save({ session });
      await course.save({ session });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    res.status(200).json({ message: "Successfully enrolled in course" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Add a review to a course
export const addCourseReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const courseId = new mongoose.Types.ObjectId(req.params.courseId);
    const { rating, comment } = req.body;
    const studentId = req.user?._id as mongoose.Types.ObjectId;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    const review = {
      user: studentId,
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

// Take a quiz and submit answers
export const takeQuiz = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const quizId = new mongoose.Types.ObjectId(req.params.quizId);
    const studentId = req.user?._id as mongoose.Types.ObjectId;
    const { answers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    let score = 0;
    const results: { question: string; correct: boolean }[] = [];

    quiz.questions.forEach((question, index) => {
      const correctAnswers = question.correctAnswers.sort().join(",");
      const studentAnswers = answers[index]?.sort().join(",") || "";

      if (correctAnswers === studentAnswers) {
        score += question.points || 1;
        results.push({ question: question.text, correct: true });
      } else {
        results.push({ question: question.text, correct: false });
      }
    });

    const passed = score >= (quiz.passingScore || 0);

    student.completedQuizzes = student.completedQuizzes || [];
    student.completedQuizzes.push({
      quizId,
      score,
      passed,
    });

    await student.save();

    res.status(200).json({
      message: passed ? "Passed" : "Failed",
      score,
      passingScore: quiz.passingScore,
      results,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// View quiz results
export const getQuizResults = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const quizId = new mongoose.Types.ObjectId(req.params.quizId);

    const quiz = await Quiz.findById(quizId).populate("course");
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    res.status(200).json({ quiz });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
