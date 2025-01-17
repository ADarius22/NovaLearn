import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import User from '../../models/User';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
  
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        res.status(400).json({ message: 'Invalid email or password' });
        return;
      }
  
      // Compare the provided password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(400).json({ message: 'Invalid email or password' });
        return;
      }
  
      // Generate a new sessionId and save it to the user
      user.sessionId = uuidv4();
      await user.save();
  
      // Respond with a success message and the sessionId
      res.status(200).json({ message: 'Login successful', sessionId: user.sessionId, user });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
  
  export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: "Email already registered" });
        return;
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: "student", // Default role set to 'student'
      });
  
      await newUser.save();
  
      res.status(201).json({
        message: "User registered successfully as a student",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
  
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
  
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
  
      res.status(200).json({ message: 'User deleted successfully', user });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

 // Get all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await User.find(); // Query all users from the User collection
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  // Get a user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
  
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
  
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Update a user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { name, email, password } = req.body;

      const user = await User.findByIdAndUpdate(userId, { name, email, password });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    try{
        const { userId } = req.params;
        const user = await User.findById (userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        user.sessionId = undefined;

        res.status(200).json({ message: 'User logged out successfully', user });
    }
    catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};