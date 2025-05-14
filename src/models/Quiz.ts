// src/models/quiz.model.ts
// ────────────────────────────────────────────────────────────────────────────────
//  Quiz schema (lean, no results array). Each student submission lives in the
//  separate QuizAttempt collection.
// ────────────────────────────────────────────────────────────────────────────────

import { Schema, model, Types, Document } from 'mongoose';

export interface IQuizQuestion {
  text: string;
  options: string[];
  correctAnswer: string;   // single correct answer keeps scoring simple
  points?: number;         // default 1
}

export interface IQuiz extends Document {
  title: string;
  description?: string;
  course: Types.ObjectId;      // ref: Course
  instructor: Types.ObjectId;  // ref: User (role = INSTRUCTOR)
  questions: IQuizQuestion[];
  duration?: number;           // minutes
  passingScore?: number;       // raw points or percentage depending on your UI
  createdAt?: Date;
  updatedAt?: Date;
}

const QuestionSchema = new Schema<IQuizQuestion>(
  {
    text:          { type: String, required: true },
    options:       { type: [String], required: true },
    correctAnswer: { type: String, required: true },
    points:        { type: Number, default: 1 },
  },
  { _id: false },
);

const QuizSchema = new Schema<IQuiz>(
  {
    title:       { type: String, required: true },
    description: { type: String },

    course:     { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    instructor: { type: Schema.Types.ObjectId, ref: 'User',   required: true },

    questions: [QuestionSchema],

    duration:     Number,  // e.g., 30 for 30‑minute quiz
    passingScore: Number,  // e.g., 70 for 70%
  },
  { timestamps: true },
);

export default model<IQuiz>('Quiz', QuizSchema);
