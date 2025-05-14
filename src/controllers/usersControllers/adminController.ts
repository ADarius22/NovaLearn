// src/controllers/admin.controller.ts
// ────────────────────────────────────────────────────────────────────────────────
//  Admin-only maintenance endpoints
//  • List / view users (with optional role filter, pagination)
//  • Promote a student to instructor (creates pending application)
//  • Approve or revoke an instructor application
//  • Hard-delete any user
//  (All heavy lifting lives in AdminService / UserService)
// ────────────────────────────────────────────────────────────────────────────────

import { Request, Response } from 'express';
import AdminService from '../services/admin.service';
import UserService from '../services/user.service';
import { UserRole } from '../../models/user.model';

// ────────────────────────────────────────────────────────────────────────────────
//  1.  User management
// ────────────────────────────────────────────────────────────────────────────────

// GET /admin/users?role=student&page=1&limit=20
export const listUsers = async (req: Request, res: Response) => {
  const {
    role,
    page = '1',
    limit = '20',
    search = '',
  } = req.query as Record<string, string>;

  const result = await UserService.listPaginated({
    role: role as UserRole | undefined,
    search,
    page: Number(page),
    limit: Number(limit),
  });

  res.json(result);
};

// GET /admin/users/:id
export const getUser = async (req: Request, res: Response) => {
  const user = await UserService.findById(req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
};

// DELETE /admin/users/:id  (hard delete)
export const deleteUser = async (req: Request, res: Response) => {
  await UserService.hardDelete(req.params.id);
  res.status(204).send();
};

// ────────────────────────────────────────────────────────────────────────────────
//  2.  Instructor promotion / approval flow
// ────────────────────────────────────────────────────────────────────────────────

// PATCH /admin/users/:id/promote
export const promoteToInstructor = async (req: Request, res: Response) => {
  const instructorDoc = await AdminService.promoteToInstructor(req.params.id);
  res.json({
    message: 'User promoted to instructor (pending approval)',
    instructor: instructorDoc,
  });
};

// PATCH /admin/instructors/:id/approve
export const approveInstructor = async (req: Request, res: Response) => {
  const instructorDoc = await AdminService.approveInstructor(req.params.id);
  res.json({
    message: 'Instructor application approved',
    instructor: instructorDoc,
  });
};

// PATCH /admin/instructors/:id/revoke
export const revokeInstructor = async (req: Request, res: Response) => {
  const instructorDoc = await AdminService.revokeInstructor(req.params.id);
  res.json({
    message: 'Instructor privileges revoked',
    instructor: instructorDoc,
  });
};
