import mongoose, { Schema } from 'mongoose';
import { IUser } from './User';

export interface IInstructor extends Omit<IUser, 'role'> {
  role: 'instructor'; // Override the role
  applicationStatus: 'pending' | 'approved' | 'rejected'; // Status of the instructor application
  biography?: string; // Short bio for the instructor
  expertise?: string[]; // Array of expertise fields
  documents?: string[]; // Array of document paths
}

const InstructorSchema = new Schema<IInstructor>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['instructor'], default: 'instructor' }, // Explicitly set the role to 'instructor'
  sessionId: { type: String },
  applicationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  biography: { type: String },
  expertise: [{ type: String }], // Array of expertise fields
  documents: [{ type: String }], // Array of document paths
});

export default mongoose.model<IInstructor>('Instructor', InstructorSchema);
