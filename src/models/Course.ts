import mongoose, { Schema, Document } from "mongoose";

export interface ICourse extends Document {
  title: string;
  description?: string;
  duration: number;
  createdBy: mongoose.Types.ObjectId; // Reference to the user who created the course
  participants?: mongoose.Types.ObjectId[]; // Array of user IDs who enrolled in the course
  materials?: string[]; // Array of file paths or URLs for course materials
  reviews?: {
    user: mongoose.Types.ObjectId;
    rating: number;
    comment?: string;
    createdAt: Date;
  }[]; // Array of review objects
  progress?: Record<string, string[]>; // Tracks user progress (userId -> lessonIds completed)
  instructor?: mongoose.Types.ObjectId; // Reference to the instructor
  lessons?: {
    lessonId: string;
    title: string;
    content?: string;
  }[]; // Array of lessons in the course
}

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  participants: { type: [{ type: Schema.Types.ObjectId, ref: "User" }], default: [] },
  materials: { type: [String], default: [] },
  reviews: {
    type: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
  progress: { type: Map, of: [String], default: () => new Map() },
  instructor: { type: Schema.Types.ObjectId, ref: "User" },
  lessons: {
    type: [
      {
        lessonId: { type: String, required: true },
        title: { type: String, required: true },
        content: { type: String },
      },
    ],
    default: [],
  },
});

export default mongoose.model<ICourse>("Course", CourseSchema);
