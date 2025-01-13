import { Request, Response } from 'express';
import * as userService from '../services/userService';
import User from '../models/User';
import bcrypt from 'bcrypt';


export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, email, password, role } = req.body;

  try {
    await userService.registerUser({ name, email, password, role });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(400).json({ error: (error as Error).message });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const sessionId = await userService.loginUser(email, password);
    res.status(200).json({ message: 'Login successful', sessionId });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(400).json({ error: (error as Error).message });
  }
};

export const registerUserAsInstructor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, biography, expertise } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email is already registered' });
      return;
    }

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
      role: 'user', 
      applicationStatus: 'pending',
    });

    await newUser.save();
    res.status(201).json({ message: 'Instructor application submitted successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { sessionid } = req.headers;

  if (!sessionid || typeof sessionid !== 'string') {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const user = await userService.getUserProfile(sessionid);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res
      .status(500)
      .json({
        error: 'Internal Server Error',
        details: (error as Error).message,
      });
  }
};

export const promoteUserToAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;

  try {
    const updatedUser = await userService.promoteToAdmin(userId);
    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res
      .status(200)
      .json({ message: 'User promoted to admin', user: updatedUser });
  } catch (error) {
    console.error('Promote Error:', error);
    res
      .status(500)
      .json({
        error: 'Internal Server Error',
        details: (error as Error).message,
      });
  }
};

export const updateUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { sessionid } = req.headers;
  const updateData = req.body;

  if (!sessionid || typeof sessionid !== 'string') {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const updatedUser = await userService.updateUserProfile(
      sessionid,
      updateData
    );
    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Update Profile Error:', error);
    res
      .status(500)
      .json({
        error: 'Internal Server Error',
        details: (error as Error).message,
      });
  }
};

export const deleteUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { sessionid } = req.headers;

  if (!sessionid || typeof sessionid !== 'string') {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const deletedUser = await userService.deleteUserProfile(sessionid);
    if (!deletedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete Profile Error:', error);
    res
      .status(500)
      .json({
        error: 'Internal Server Error',
        details: (error as Error).message,
      });
  }
};

export const logoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { sessionid } = req.headers;

  if (!sessionid || typeof sessionid !== 'string') {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    await userService.logoutUser(sessionid);
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    res
      .status(500)
      .json({
        error: 'Internal Server Error',
        details: (error as Error).message,
      });
  }
};

export const reviewInstructorApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { decision, reason } = req.body; // `decision` should be 'approved' or 'rejected'

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (decision === 'approved') {
      user.role = 'instructor';
      user.applicationStatus = 'approved';
    } else if (decision === 'rejected') {
      user.applicationStatus = 'rejected';
      user.documents = []; 
    } else {
      res.status(400).json({ error: 'Invalid decision' });
      return;
    }

    await user.save();

    res.status(200).json({
      message: `Application ${decision} successfully`,
      user,
      reason: decision === 'rejected' ? reason : undefined,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};


