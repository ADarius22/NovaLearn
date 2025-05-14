import { Request, Response } from 'express';
import * as enrollmentService from '../../services/enrollmentService';
import * as quizAttemptService from '../../services/quizAttemptService';

// ────────────────────────────────────────────────
// 1. Enroll in a course
// ────────────────────────────────────────────────
export const enrollInCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { courseId } = req.params;

    if (!studentId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await enrollmentService.enroll(studentId, courseId);
    res.status(200).json({ message: 'Enrollment successful', data: result });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
    return;
  }
};

// ────────────────────────────────────────────────
// 2. Unenroll from a course
// ────────────────────────────────────────────────
export const unenrollFromCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { courseId } = req.params;

    if (!studentId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await enrollmentService.unenroll(studentId, courseId);
    res.status(200).json({ message: 'Unenrolled successfully' });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
    return;
  }
};

// ────────────────────────────────────────────────
// 3. Get enrolled courses
// ────────────────────────────────────────────────
export const getEnrolledCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const courses = await enrollmentService.listByStudent(studentId);
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch enrolled courses' });
    return;
  }
};

// ────────────────────────────────────────────────
// 4. Mark lesson as completed
// ────────────────────────────────────────────────
export const markLessonCompleted = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { courseId, lessonId } = req.params;

    if (!studentId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await enrollmentService.updateProgress(studentId, courseId, lessonId);
    res.status(200).json({ message: 'Lesson marked as completed' });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
    return;
  }
};

// ────────────────────────────────────────────────
// 5. Submit quiz attempt
// ────────────────────────────────────────────────
export const submitQuizAttempt = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { quizId } = req.params;
    const { answers } = req.body;

    if (!studentId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await quizAttemptService.submit(quizId, studentId, answers);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
    return;
  }
};

// ────────────────────────────────────────────────
// 6. Get quiz attempt history
// ────────────────────────────────────────────────
export const getQuizAttempts = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const attempts = await quizAttemptService.getAttempts(studentId);
    res.status(200).json(attempts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quiz history' });
    return;
  }
};
