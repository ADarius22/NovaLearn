// src/controllers/profile.controller.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware'; // Ensures proper typing for authenticated requests
import UserService from '../services/user.service';

// ── GET /me
export const getMyProfile = async (req: AuthenticatedRequest, res: Response) => {
  const me = await UserService.findById(req.user!.id);
  res.json(me);
};

// ── PATCH /me
export const updateMyProfile = async (req: AuthenticatedRequest, res: Response) => {
  const updated = await UserService.update(req.user!.id, req.body);
  res.json(updated);
};

// ── DELETE /me
export const deleteMyProfile = async (req: AuthenticatedRequest, res: Response) => {
  await UserService.softDelete(req.user!.id);
  res.status(204).send();
};
