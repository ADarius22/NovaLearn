import { Request, Response } from 'express';
import { User, Instructor, UserRole } from '../../models/User';
import bcrypt from 'bcrypt';
import * as instructorService from '../../services/instructorService';

// ─────────────────────────────────────────────
// 1. View own profile
// ─────────────────────────────────────────────
export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id)
      .select('-password -resetPassword')
      .lean();

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(user);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
    return;
  }
};

// ─────────────────────────────────────────────
// 2. Update name/email
// ─────────────────────────────────────────────
export const updateMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, email } = req.body;

    const updated = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password -resetPassword');

    res.status(200).json({
      message: 'Profile updated successfully',
      data: updated,
    });
    return;
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
    return;
  }
};

// ─────────────────────────────────────────────
// 3. Check instructor application status
// ─────────────────────────────────────────────
export const getMyInstructorStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    if (req.user?.role !== UserRole.INSTRUCTOR) {
      res.status(403).json({ error: 'Not an instructor' });
      return;
    }

    const status = await instructorService.getStatus(userId);
    res.status(200).json(status);
    return;
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
    return;
  }
};

// ─────────────────────────────────────────────
// 4. Change password securely
// ─────────────────────────────────────────────
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('+password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      res.status(403).json({ error: 'Current password is incorrect' });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
    return;
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
    return;
  }
};
