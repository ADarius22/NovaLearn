// src/services/user.service.ts
// ────────────────────────────────────────────────────────────────────────────────
//  Generic user‑centric DB helpers (no auth logic).
//  Used by profileController, adminController, etc.
// ────────────────────────────────────────────────────────────────────────────────

import { User, IUserBase, UserRole } from '../models/User';
import { FilterQuery, UpdateQuery } from 'mongoose';

// ────────────────────────────────────────────────────────────────────────────────
//  CRUD helpers
// ────────────────────────────────────────────────────────────────────────────────

export const findById = (id: string) =>
  User.findById(id).select('-password -resetPassword').lean();

export const update = (id: string, payload: UpdateQuery<IUserBase>) =>
  User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
    projection: '-password -resetPassword',
  }).lean();

export const softDelete = (id: string) =>
  User.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: false });

export const hardDelete = (id: string) => User.findByIdAndDelete(id);

// ────────────────────────────────────────────────────────────────────────────────
//  Admin helpers
// ────────────────────────────────────────────────────────────────────────────────

interface PaginatedOpts {
  role?: UserRole;
  search?: string;
  page?: number;
  limit?: number;
}

export const listPaginated = async ({
  role,
  search = '',
  page = 1,
  limit = 20,
}: PaginatedOpts) => {
  const filter: FilterQuery<IUserBase> = { isDeleted: { $ne: true } };
  if (role) filter.role = role;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    User.find(filter)
      .select('-password -resetPassword')
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return { page, limit, total, items };
};
