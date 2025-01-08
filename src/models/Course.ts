import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description?: string;
  duration: number;
  createdBy: mongoose.Types.ObjectId; // Use mongoose.Types.ObjectId for references
  participants?: mongoose.Types.ObjectId[]; // Array of ObjectId references
}

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Array of User references
});

export default mongoose.model<ICourse>('Course', CourseSchema);
