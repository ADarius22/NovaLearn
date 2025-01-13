import mongoose, { Schema } from 'mongoose';
import { IUser } from './User';

export interface IAdmin extends Omit<IUser, 'role'> {
  role: 'admin'; // Override the role
  permissions?: string[]; // Optional: Define admin-specific permissions
}

const AdminSchema = new Schema<IAdmin>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin'], default: 'admin' }, // Explicitly set the role to 'admin'
  sessionId: { type: String },
  permissions: [{ type: String }], // Array of strings for admin-specific permissions
});

export default mongoose.model<IAdmin>('Admin', AdminSchema);
