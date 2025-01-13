import Admin, { IAdmin } from '../models/Admin';
import Instructor, { IInstructor } from '../models/Instructor';
import User, { IUser } from '../models/User';

// Promote a user to admin
export const promoteToAdmin = async (userId: string): Promise<IAdmin | null> => {
  const admin = await Admin.findByIdAndUpdate(
    userId,
    { role: 'admin' },
    { new: true }
  );
  if (!admin) throw new Error('Admin not found.');
  return admin;
};

// Review an instructor application
export const reviewInstructorApplication = async (
  userId: string,
  decision: 'approved' | 'rejected',
  reason?: string
): Promise<IInstructor | null> => {
  const instructor = await Instructor.findById(userId);
  if (!instructor) throw new Error('Instructor not found.');

  if (decision === 'approved') {
    instructor.role = 'instructor';
    instructor.applicationStatus = 'approved';
  } else if (decision === 'rejected') {
    instructor.applicationStatus = 'rejected';
    instructor.documents = []; // Clear documents if rejected
  } else {
    throw new Error('Invalid decision.');
  }

  await instructor.save();
  return instructor;
};