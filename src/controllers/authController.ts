import { Request, Response } from 'express';
import User from '../models/User';
import * as authService from '../services/authService';
import bcrypt from 'bcrypt';


export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, email, password, role } = req.body;

  try {
    await authService.registerUser({ name, email, password, role });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(400).json({ error: (error as Error).message });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const sessionId = await authService.loginUser(email, password);
    res.status(200).json({ message: 'Login successful', sessionId });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(400).json({ error: (error as Error).message });
  }
};

export const registerInstructor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, biography, expertise } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email is already registered' });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save uploaded documents (if using Multer for uploads)
    const documents = (req.files as Express.Multer.File[])?.map((file: Express.Multer.File) => file.path);

    // Create a new user with `pending` application status
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      biography,
      expertise,
      documents,
      role: 'user', // Starts as a regular user
      applicationStatus: 'pending',
    });

    await newUser.save();
    res.status(201).json({ message: 'Instructor application submitted successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

