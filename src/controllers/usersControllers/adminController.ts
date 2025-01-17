import { Request, Response } from 'express';
import Admin from '../../models/Admin'; // Admin model
import Instructor, { IInstructor } from '../../models/Instructor'; // Instructor model
import User from '../../models/User'; // User model
import Course from '../../models/Course'; // Course model
import mongoose from 'mongoose';
import * as adminService from "../../services/adminService";
// Approve or reject instructor applications
export const reviewInstructorApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { decision, reason } = req.body; // `decision` should be 'approved' or 'rejected'

    // Use the Instructor model for applications
    const instructor = await Instructor.findById(userId);
    if (!instructor) {
      res.status(404).json({ error: 'Instructor not found' });
      return;
    }

    if (decision === 'approved') {
      instructor.role = 'instructor';
      instructor.applicationStatus = 'approved';
    } else if (decision === 'rejected') {
      instructor.applicationStatus = 'rejected';
      instructor.documents = []; // Clear documents if rejected
    } else {
      res.status(400).json({ error: 'Invalid decision' });
      return;
    }

    await instructor.save();

    res.status(200).json({
      message: `Application ${decision} successfully`,
      instructor,
      reason: decision === 'rejected' ? reason : undefined,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};


// Promote a user to instructor (route handler)
export const promoteUserToInstructor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: 'instructor', applicationStatus: 'approved' },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'User promoted to instructor successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Promote a user to admin
export const promoteToAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const updatedAdmin = await adminService.promoteToAdmin(userId);
    if (!updatedAdmin) {
      res.status(404).json({ message: "User not found or already an admin." });
      return;
    }

    res.status(200).json({
      message: "User promoted to admin successfully.",
      admin: updatedAdmin,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
