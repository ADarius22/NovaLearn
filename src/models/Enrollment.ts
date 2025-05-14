// src/models/enrollment.model.ts
// ────────────────────────────────────────────────────────────────────────────────
//  Links a student to a course and tracks per‑student progress.
//  One document per (student, course) pair keeps Course docs small and writes
//  contention‑free.
// ────────────────────────────────────────────────────────────────────────────────

import { Schema, model, Types } from 'mongoose';

export interface IEnrollment {
  student: Types.ObjectId;           // ref → User (role: student by default)
  course:  Types.ObjectId;           // ref → Course
  completedLessons: string[];        // lessonId strings (keep it agnostic)
  createdAt?: Date;
  updatedAt?: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    completedLessons: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// Prevent a student from enrolling in the same course twice
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default model<IEnrollment>('Enrollment', EnrollmentSchema);
