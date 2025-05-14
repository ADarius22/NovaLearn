// src/models/user.model.ts
// ────────────────────────────────────────────────────────────────────────────────
//  NovaLearn – User & Role Schemas (default ➜ Student)
//  -----------------------------------------------------------------------------
//  Rationale
//  ---------
//  • A single `users` collection with Mongoose discriminators keeps the data
//    model lean.
//  • "Student" is by far the most common account type, so we set it as the
//    default `role` – a fresh sign‑up instantly behaves like a Student unless
//    promoted to Instructor or Admin.
//  • The `passwordPlugin` means hashing logic is centralised and inherited by
//    every future role without extra boilerplate.
//  -----------------------------------------------------------------------------

import mongoose, { Schema, model, Types, Document } from 'mongoose';
import bcrypt from 'bcrypt';

// ────────────────────────────────────────────────────────────────────────────────
//  Shared enums & helpers
// ────────────────────────────────────────────────────────────────────────────────

export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
}

// Adjust this if you ever need stronger hashing
const BCRYPT_ROUNDS = 10;

// ────────────────────────────────────────────────────────────────────────────────
//  Password plugin – single source of truth for hashing & comparison
// ────────────────────────────────────────────────────────────────────────────────

function passwordPlugin<T extends Document>(schema: Schema<T>): void {
  schema.pre('save', async function (next) {
    const doc = this as unknown as { password: string; isModified: (k: string) => boolean };
    if (!doc.isModified('password')) return next();
    try {
      const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
      doc.password = await bcrypt.hash(doc.password, salt);
      next();
    } catch (err) {
      next(err as Error);
    }
  });

  schema.methods.comparePassword = function (candidate: string): Promise<boolean> {
    return bcrypt.compare(candidate, (this as { password: string }).password);
  };
}

declare module 'mongoose' {
  interface Document {
    comparePassword?(candidate: string): Promise<boolean>;
  }
}

// ────────────────────────────────────────────────────────────────────────────────
//  Base User – fields common to every account type
// ────────────────────────────────────────────────────────────────────────────────

export interface IUserBase extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole; // defaults to STUDENT
  sessionId?: string;

  resetPassword?: {
    tokenHash: string;
    expiresAt: Date;
  };
}

const baseOptions = {
  discriminatorKey: 'role',
  timestamps: true,
} as const;

const UserSchema = new Schema<IUserBase>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT, // ⇠ default role
    },
    sessionId: { type: String },



    resetPassword: {
      tokenHash: { type: String },
      expiresAt: { type: Date },
      select: false,
    },

  },
  { discriminatorKey: 'role', timestamps: true }
);

UserSchema.plugin(passwordPlugin);

export const User = model<IUserBase>('User', UserSchema);

// ────────────────────────────────────────────────────────────────────────────────
//  Student – enrolments & quiz history (default role)
// ────────────────────────────────────────────────────────────────────────────────

export interface IStudent extends IUserBase {
  role: UserRole.STUDENT;
  enrolledCourses?: Types.ObjectId[];
  completedQuizzes?: {
    quizId: Types.ObjectId;
    score: number;
    passed: boolean;
  }[];
}

const StudentSchema = new Schema<IStudent>({
  enrolledCourses: [{ type: Types.ObjectId, ref: 'Course' }],
  completedQuizzes: [
    {
      quizId: { type: Types.ObjectId, ref: 'Quiz', required: true },
      score: { type: Number, required: true },
      passed: { type: Boolean, required: true },
    },
  ],
});

export const Student = User.discriminator<IStudent>('Student', StudentSchema);

// ────────────────────────────────────────────────────────────────────────────────
//  Instructor – application workflow & portfolio
// ────────────────────────────────────────────────────────────────────────────────

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface IInstructor extends IUserBase {
  role: UserRole.INSTRUCTOR;
  applicationStatus: ApplicationStatus;
  biography?: string;
  expertise?: string[];
  documents?: string[];

  // ⬇️  add these
  reviewedAt?: Date;
  reviewNotes?: string;
}

const InstructorSchema = new Schema<IInstructor>(
  {
    applicationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    biography:  String,
    expertise:  [String],
    documents:  [String],

    // ⬇️  new paths
    reviewedAt:  Date,
    reviewNotes: String,
  },
  { _id: false }                // no extra _id for the sub-schema
);

export const Instructor = User.discriminator<IInstructor>(
  'Instructor',
  InstructorSchema
);


// ────────────────────────────────────────────────────────────────────────────────
//  Admin – permission flags / future ACL hooks
// ────────────────────────────────────────────────────────────────────────────────

export interface IAdmin extends IUserBase {
  role: UserRole.ADMIN;
  permissions?: string[];
}

const AdminSchema = new Schema<IAdmin>({
  permissions: [{ type: String }],
});

export const Admin = User.discriminator<IAdmin>('Admin', AdminSchema);

// ────────────────────────────────────────────────────────────────────────────────
//  Barrel exports – keep import lines short
// ────────────────────────────────────────────────────────────────────────────────

export default {
  User,
  Student,
  Instructor,
  Admin,
};
