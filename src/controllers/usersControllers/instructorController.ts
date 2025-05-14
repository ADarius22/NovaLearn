import { Request, Response } from 'express';
import * as instructorService from '../../services/instructorService';
import { UserRole } from '../../models/User';

// ─────────────────────────────────────────────────────────────
//  1. Apply to become an instructor (for students)
// ─────────────────────────────────────────────────────────────

export const applyForInstructor = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!req.user || req.user.role !== UserRole.STUDENT) {
      res.status(400).json({ error: 'Only students can apply to become instructors' });
      return;
    }

    const result = await instructorService.applyForInstructor(userId, req.body);
    res.status(200).json({ message: 'Application submitted', ...result });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message || 'Failed to apply' });
  }
};

// ─────────────────────────────────────────────────────────────
//  2. View instructor application status
// ─────────────────────────────────────────────────────────────

export const getApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const status = await instructorService.getStatus(userId);
    res.status(200).json(status);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message || 'Failed to fetch status' });
  }
};

// ─────────────────────────────────────────────────────────────
//  3. Instructor dashboard summary
// ─────────────────────────────────────────────────────────────

export const listMyCoursesStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const instructorId = req.user?.id;
    if (!instructorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const stats = await instructorService.listMyCoursesStats(instructorId);
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message || 'Failed to fetch course stats' });
  }
};
