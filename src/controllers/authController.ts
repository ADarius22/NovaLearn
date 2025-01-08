import { Request, Response } from 'express';
import User from '../models/User';
import * as authService from '../services/authService';

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
