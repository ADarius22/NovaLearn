import { Request, Response } from 'express';
import * as userService from '../services/userService';
import User from '../models/User';

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
      user.documents = []; // Clear uploaded documents if rejected
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


