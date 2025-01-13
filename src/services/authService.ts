import User, { IUser } from '../models/User';
import md5 from 'md5';
import { v4 as uuidv4 } from 'uuid';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user' | 'instructor';
}



export const loginUser = async (
  email: string,
  password: string
): Promise<string> => {
  const user = await User.findOne({ email, password: md5(password) });
  if (!user) throw new Error('Invalid email or password.');

  user.sessionId = uuidv4();
  await user.save();

  return user.sessionId;
};


export const registerUser = async ({
  name,
  email,
  password,
  role = 'user',
}: RegisterInput): Promise<void> => {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const namePattern = /^[a-zA-Z\s]+$/;
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{5,}$/;

  if (!emailPattern.test(email))
    throw new Error('Invalid email format. Example: user@example.com');
  if (!namePattern.test(name))
    throw new Error('Name should contain only letters and spaces.');
  if (!passwordPattern.test(password)) {
    throw new Error(
      'Password must include at least 5 characters, an uppercase letter, and a number.'
    );
  }

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
