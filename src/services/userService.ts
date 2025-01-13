import User, { IUser } from '../models/User';
import md5 from 'md5';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { verifyInputCredentials as verifyInput } from '../utils/index';

interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user' | 'instructor';
}

interface RegisterInstructorInput {
  name: string;
  email: string;
  password: string;
  biography: string;
  expertise: string;
  documents?: string[];
}

export const registerInstructor = async (input: RegisterInstructorInput) => {
  const { name, email, password, biography, expertise, documents } = input;
  verifyInput(email, name, password);

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email is already registered');
  }

  const hashedPassword = md5(password);
  const sessionId = uuidv4();

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    sessionId,
    biography,
    expertise,
    documents,
    role: 'user',
    applicationStatus: 'pending',
  });

  await newUser.save();
  return newUser;
};

export const loginUser = async (email: string, password: string): Promise<string> => {
  const user = await User.findOne({ email, password: md5(password) });
  if (!user) throw new Error('Invalid email or password.');

  user.sessionId = uuidv4();
  await user.save();

  return user.sessionId;
};


export const registerUser = async ({name,email,password,role = 'user',}: RegisterUserInput): Promise<void> => {
  verifyInput(email, name, password);
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('Email is already registered.');

  const encryptedPassword = md5(password);
  const sessionId = uuidv4();

  const newUser = new User({
    name,
    email,
    password: encryptedPassword,
    sessionId,
    role,
  });

  await newUser.save();
};

export const getUserProfile = async (
  sessionId: string
): Promise<IUser | null> => {
  return await User.findOne({ sessionId });
};

export const updateUserProfile = async (
  sessionId: string,
  updateData: Partial<IUser>
): Promise<IUser | null> => {
  return await User.findOneAndUpdate({ sessionId }, updateData, { new: true });
};

export const deleteUserProfile = async (
  sessionId: string
): Promise<IUser | null> => {
  return await User.findOneAndDelete({ sessionId });
};

export const logoutUser = async (sessionId: string): Promise<void> => {
  const user = await User.findOne({ sessionId });
  if (user) {
    user.sessionId = undefined;
    await user.save();
  }
};

export const promoteToAdmin = async (userId: string): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(userId, { role: 'admin' }, { new: true });
};

