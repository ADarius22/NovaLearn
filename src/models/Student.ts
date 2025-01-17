import mongoose, { Schema } from "mongoose";
import { IUser } from "./User";

// Define the IStudent interface extending IUser
export interface IStudent extends Omit<IUser, "role"> {
  role: "student"; // Override the role
  enrolledCourses?: mongoose.Types.ObjectId[]; // Array of enrolled course IDs
  completedQuizzes?: {
    quizId: mongoose.Types.ObjectId; // Reference to the Quiz model
    score: number; // Student's score for the quiz
    passed: boolean; // Whether the quiz was passed
  }[]; // Array to track completed quizzes
}

// Define the StudentSchema
const StudentSchema = new Schema<IStudent>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student"], default: "student" }, // Explicitly set the role to 'student'
  sessionId: { type: String },
  enrolledCourses: [
    { type: mongoose.Types.ObjectId, ref: "Course" } // References the Course model
  ],
  completedQuizzes: [
    {
      quizId: { type: mongoose.Types.ObjectId, ref: "Quiz", required: true },
      score: { type: Number, required: true },
      passed: { type: Boolean, required: true }
    }
  ]
});

export default mongoose.model<IStudent>("Student", StudentSchema);
