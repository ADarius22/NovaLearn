import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'instructor';
  sessionId?: string;
  applicationStatus?: 'pending' | 'approved' | 'rejected';
  biography?: string;
  expertise?: string[];
  documents?: string[]; // Paths to uploaded documents
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user', 'instructor'], default: 'user' },
  sessionId: { type: String },
  applicationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  biography: { type: String },
  expertise: [{ type: String }],
  documents: [{ type: String }],
});

export default mongoose.model<IUser>('User', UserSchema);
