import { Request, Response } from 'express';
import * as adminService from '../../services/adminService';
import { UserRole } from '../../models/User';

// ─────────────────────────────────────────────────────────────
//  1. List / search users
// ─────────────────────────────────────────────────────────────

export const listUsers = async (req: Request, res: Response) => {
  try {
    const { role, search, page, limit } = req.query;

    const result = await adminService.listUsers({
      role: role as UserRole,
      search: String(search || ''),
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// ─────────────────────────────────────────────────────────────
//  2. Promote student → instructor (pending)
// ─────────────────────────────────────────────────────────────

export const promoteToInstructor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await adminService.promoteToInstructor(id);
    res.status(200).json({
      message: 'User promoted to instructor (pending approval)',
      data: user,
    });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

// ─────────────────────────────────────────────────────────────
//  3. Approve instructor application
// ─────────────────────────────────────────────────────────────

export const approveInstructor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const updated = await adminService.approveInstructor(id, notes);
    res.status(200).json({
      message: 'Instructor approved successfully',
      data: updated,
    });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

// ─────────────────────────────────────────────────────────────
//  4. Revoke instructor privileges
// ─────────────────────────────────────────────────────────────

export const revokeInstructor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const updated = await adminService.revokeInstructor(id, notes);
    res.status(200).json({
      message: 'Instructor privileges revoked',
      data: updated,
    });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

// ─────────────────────────────────────────────────────────────
//  5. Promote user → admin
// ─────────────────────────────────────────────────────────────

export const promoteToAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await adminService.promoteToAdmin(id);
    res.status(200).json({
      message: 'User promoted to admin successfully',
      data: user,
    });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};
