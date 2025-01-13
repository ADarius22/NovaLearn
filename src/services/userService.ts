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

export const registerUser = async (input: RegisterUserInput): Promise<void> => {
  const { name, email, password, role = 'user' } = input;
  verifyInput(email, name, password);

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('Email is already registered.');

  const hashedPassword = hashPassword(password);
  const sessionId = uuidv4();

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    sessionId,
    role,
  });

  await newUser.save();
};

export const loginUser = async (email: string, password: string): Promise<string> => {
  const user = await User.findOne({ email, password: hashPassword(password) });
  if (!user) throw new Error('Invalid email or password.');

  user.sessionId = uuidv4();
  await user.save();

  return user.sessionId;
};

export const getUserProfile = async (sessionId: string): Promise<IUser | null> => {
  return await User.findOne({ sessionId });
};

export const updateUserProfile = async (
  sessionId: string,
  updateData: Partial<IUser>
): Promise<IUser | null> => {
  return await User.findOneAndUpdate({ sessionId }, updateData, { new: true });
};

export const deleteUserProfile = async (sessionId: string): Promise<IUser | null> => {
  return await User.findOneAndDelete({ sessionId });
};

export const logoutUser = async (sessionId: string): Promise<void> => {
  const user = await User.findOne({ sessionId });
  if (user) {
    user.sessionId = undefined;
    await user.save();
  }
};
