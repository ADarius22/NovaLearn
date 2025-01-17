import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
  title: string;
  description?: string;
  course: mongoose.Types.ObjectId;
  questions: {
    text: string;
    options: string[];
    correctAnswers: string[];
    points?: number;
  }[];
  duration?: number;
  passingScore?: number;
  createdBy: mongoose.Types.ObjectId;
  results?: {
    student: mongoose.Types.ObjectId;
    score: number;
    passed: boolean;
    detailedResults: { question: string; correct: boolean }[];
  }[]; // Optional: Stores quiz results for students
}

const QuizSchema = new Schema<IQuiz>({
  title: { type: String, required: true },
  description: { type: String },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  questions: [
    {
      text: { type: String, required: true },
      options: { type: [String], required: true },
      correctAnswers: { type: [String], required: true },
      points: { type: Number, default: 1 },
    },
  ],
  duration: { type: Number },
  passingScore: { type: Number },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Instructor', required: true },
  results: {
    type: [
      {
        student: { type: mongoose.Types.ObjectId, ref: 'student', required: true },
        score: { type: Number, required: true },
        passed: { type: Boolean, required: true },
        detailedResults: { type: [{ question: String, correct: Boolean }], required: true },
      },
    ],
    default: [],
  },
});

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
