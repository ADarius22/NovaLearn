// src/models/quizAttempt.model.ts
// ────────────────────────────────────────────────────────────────────────────────
//  One document per quiz submission. Keeps massive result arrays out of the
//  Quiz doc so writes scale linearly with users.
// ────────────────────────────────────────────────────────────────────────────────

import { Schema, model, Types } from 'mongoose';

export interface IQuizAnswer {
  questionId: string;  // reference to the question inside Quiz.questions
  answer: string;      // raw answer given by the student (id or text)
}

export interface IQuizAttempt {
  quiz: Types.ObjectId;        // ref → Quiz
  student: Types.ObjectId;     // ref → User (role: student)
  score: number;               // 0 – 100
  passed: boolean;
  answers: IQuizAnswer[];      // full answer sheet for review
  createdAt?: Date;            // auto via timestamps
  updatedAt?: Date;            // auto via timestamps
}

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    answers: [
      {
        questionId: { type: String, required: true },
        answer:      { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Handy for quick look‑up of a student's latest attempt on a quiz
QuizAttemptSchema.index({ student: 1, quiz: 1, createdAt: -1 });

export default model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
