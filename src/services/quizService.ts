// src/services/quiz.service.ts
// ────────────────────────────────────────────────────────────────────────────────
//  CRUD helpers for quizzes. Scoring / submissions live in quizAttempt.service.
// ────────────────────────────────────────────────────────────────────────────────

import Quiz, { IQuiz } from '../models/Quiz';
import { Types, FilterQuery } from 'mongoose';

/* ───────────────────────── 1. Public helpers ─────────────────────────────── */

export const getById = (id: string) => Quiz.findById(id).lean<IQuiz>();

export const listByCourse = (
  courseId: string,
  projection: Record<string, 0 | 1> = {},
) => Quiz.find({ course: courseId }, projection).lean<IQuiz[]>();

/* ───────────────────────── 2. Instructor helpers ─────────────────────────── */

export const listByInstructor = (
  instructorId: string,
  { page = 1, limit = 20 } = {},
) => {
  const skip = (page - 1) * limit;
  const query: FilterQuery<IQuiz> = { instructor: instructorId };
  return Quiz.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean<IQuiz[]>();
};

export const create = (payload: Partial<IQuiz> & { instructor: string }) =>
  Quiz.create(payload);

export const updateOwnedQuiz = (
  quizId: string,
  instructorId: string,
  payload: Partial<IQuiz>,
) => Quiz.findOneAndUpdate({ _id: quizId, instructor: instructorId }, payload, {
  new: true,
  runValidators: true,
}).lean<IQuiz | null>();

export const deleteOwnedQuiz = (
  quizId: string,
  instructorId: string,
) => Quiz.findOneAndDelete({ _id: quizId, instructor: instructorId });

/* ───────────────────────── 3. Admin helper ──────────────────────────────── */
export const hardDelete = (quizId: string) => Quiz.findByIdAndDelete(quizId);
