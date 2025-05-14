// src/services/admin.service.ts
// ────────────────────────────────────────────────────────────────────────────────
//  Admin‑only helpers for user & instructor management.
//  Controllers enforce authorizeAdmin(); this file focuses on DB logic.
// ────────────────────────────────────────────────────────────────────────────────

import { User, Instructor, UserRole } from '../models/User';
import { FilterQuery } from 'mongoose';

/* ───────────────────────── 1. List / search users ─────────────────────────── */
interface ListOpts {
  role?: UserRole;
  search?: string;
  page?: number;
  limit?: number;
}

export const listUsers = async ({ role, search = '', page = 1, limit = 20 }: ListOpts) => {
  const filter: FilterQuery<any> = {};
  if (role) filter.role = role;
  if (search) filter.$text = { $search: search };

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    User.find(filter).select('-password -resetPassword').skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  return { page, limit, total, items };
};

/* ───────────────────────── 2. Promote student → instructor (pending) ──────── */
export const promoteToInstructor = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  user.role = UserRole.INSTRUCTOR;
  // @ts-ignore – field exists on discriminator at runtime
  user.applicationStatus = 'pending';
  await user.save();
  return user.toObject();
};

/* ───────────────────────── 3. Approve instructor application ──────────────── */
export const approveInstructor = async (userId: string, notes?: string) => {
  const inst = await Instructor.findById(userId);
  if (!inst) throw new Error('Instructor not found');

  inst.applicationStatus = 'approved';
  inst.reviewedAt = new Date();
  inst.reviewNotes = notes;
  await inst.save();
  return inst.toObject();
};

/* ───────────────────────── 4. Revoke instructor privileges ───────────────── */
export const revokeInstructor = async (userId: string, notes?: string) => {
  const inst = await Instructor.findById(userId);
  if (!inst) throw new Error('Instructor not found');

  inst.applicationStatus = 'rejected';
  inst.reviewedAt = new Date();
  inst.reviewNotes = notes;
  // inst.role stays INSTRUCTOR – guards will block un-approved users
  await inst.save();
  return inst.toObject();
};


/* ───────────────────────── 5. Promote user → admin ───────────────────────── */
export const promoteToAdmin = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  user.role = UserRole.ADMIN;
  await user.save();
  return user.toObject();
};
