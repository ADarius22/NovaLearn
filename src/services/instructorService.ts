// instructorService.ts
// Instructor-specific services
import User, { IInstructor } from '../models/Instructor';
import { v4 as uuidv4 } from 'uuid';
import { verifyInputCredentials as verifyInput } from '../utils/index';

interface RegisterInstructorInput {
  name: string;
  email: string;
  password: string;
  biography: string;
  expertise: string;
  documents?: string[];
}

// Register an instructor (Pending approval by admin)
export const registerInstructor = async (input: RegisterInstructorInput): Promise<IInstructor> => {
  const { name, email, password, biography, expertise, documents } = input;
  verifyInput(email, name, password);

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email is already registered');
  }

  const hashedPassword = require('md5')(password);
  const sessionId = uuidv4();

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    sessionId,
    biography,
    expertise,
    documents,
    role: 'user', // Default role before approval
    applicationStatus: 'pending',
  });

  await newUser.save();
  return newUser;
};
