// userService.ts
// User-specific services
import User, { IUser } from '../models/User';
import md5 from 'md5';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { verifyInputCredentials as verifyInput } from '../utils/index';

// Interfaces for user-related inputs
interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user' | 'instructor';
}

// Utility function for password hashing
const hashPassword = (password: string): string => md5(password);


export const loginUser = async (email: string, password: string): Promise<string> => {
  const user = await User.findOne({ email, password: hashPassword(password) });
  if (!user) throw new Error('Invalid email or password.');

  user.sessionId = uuidv4();
  await user.save();

  return user.sessionId;
};


export const logoutUser = async (sessionId: string): Promise<void> => {
  const user = await User.findOne({ sessionId });
  if (user) {
    user.sessionId = undefined;
    await user.save();
  }
};
