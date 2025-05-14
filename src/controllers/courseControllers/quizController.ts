import { Request, Response } from 'express';
import * as quizService from '../../services/quizService';
import { Types } from 'mongoose';
import Quiz from '../../models/Quiz';

// ────────────────────────────────────────────────────────────────────────────────
//  1. Create a quiz
// ────────────────────────────────────────────────────────────────────────────────
export const createQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const instructorId = req.user?.id;
    const payload = { ...req.body, instructor: instructorId };
    const quiz = await quizService.create(payload);
    res.status(201).json({ message: 'Quiz created successfully', data: quiz });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

// ────────────────────────────────────────────────────────────────────────────────
//  2. Get a quiz by ID or slug
// ────────────────────────────────────────────────────────────────────────────────
export const getQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idOrSlug } = req.params;

    const quiz = Types.ObjectId.isValid(idOrSlug)
      ? await quizService.getById(idOrSlug)
      : await Quiz.findOne({ slug: idOrSlug }).lean();

    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    res.status(200).json(quiz);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

// ────────────────────────────────────────────────────────────────────────────────
//  3. Update a quiz
// ────────────────────────────────────────────────────────────────────────────────
export const updateQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const instructorId = req.user?.id;
    if (!instructorId) {
      res.status(401).json({ error: 'Unauthorized: instructor ID missing' });
      return;
    }

    const { id } = req.params;
    const updated = await quizService.updateOwnedQuiz(id, instructorId, req.body);

    if (!updated) {
      res.status(404).json({ error: 'Quiz not found or not owned by you' });
      return;
    }

    res.status(200).json({ message: 'Quiz updated', data: updated });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

// ────────────────────────────────────────────────────────────────────────────────
//  4. Delete a quiz
// ────────────────────────────────────────────────────────────────────────────────
export const deleteQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const instructorId = req.user?.id;
    if (!instructorId) {
      res.status(401).json({ error: 'Unauthorized: instructor ID missing' });
      return;
    }

    const { id } = req.params;
    const deleted = await quizService.deleteOwnedQuiz(id, instructorId);

    if (!deleted) {
      res.status(404).json({ error: 'Quiz not found or not owned by you' });
      return;
    }

    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

// ────────────────────────────────────────────────────────────────────────────────
//  5. List quizzes created by an instructor
// ────────────────────────────────────────────────────────────────────────────────
export const listMyQuizzes = async (req: Request, res: Response): Promise<void> => {
  try {
    const instructorId = req.user?.id;
    if (!instructorId) {
      res.status(401).json({ error: 'Unauthorized: instructor ID missing' });
      return;
    }

    const quizzes = await quizService.listByInstructor(instructorId);
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
};
