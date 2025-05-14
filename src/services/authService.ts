// src/services/auth.service.ts
// ────────────────────────────────────────────────────────────────────────────────
//  Handles registration, login, logout, and password-reset.
//  All password work is done with bcrypt; session IDs are UUID v4 strings.
// ────────────────────────────────────────────────────────────────────────────────

import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { User, IUserBase, UserRole } from '../models/User'
import sendEmail from '../utils/sendEmail';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;
const RESET_TOKEN_EXP_MIN = 60;                      // 1 h

// ────────────────────────────────────────────────────────────────────────────────
//  1.  Registration  (default role → Student)
// ────────────────────────────────────────────────────────────────────────────────
export const register = async ({
  name,
  email,
  password,
  role = UserRole.STUDENT,
}: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}) => {
  if (await User.exists({ email })) throw new Error('Email already in use');

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, password: hashed, role });
  const { password: _, ...safeUser } = user.toObject();

  return safeUser;
};

// ────────────────────────────────────────────────────────────────────────────────
//  2.  Login   → returns { user, sessionId }
// ────────────────────────────────────────────────────────────────────────────────
export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('Invalid credentials');

  user.sessionId = uuidv4();
  await user.save();

  const { password: _, ...safeUser } = user.toObject();
  return { user: safeUser, sessionId: user.sessionId };
};

// ────────────────────────────────────────────────────────────────────────────────
//  3.  Logout   (clear sessionId on the user record)
// ────────────────────────────────────────────────────────────────────────────────
export const logout = (sessionId: string) =>
  User.findOneAndUpdate(
    { sessionId },
    { $unset: { sessionId: '' } },
    { new: false },
  );

// ────────────────────────────────────────────────────────────────────────────────
//  4.  Forgot-password  → e-mails a reset link
//      (stores hashed token + expiry on the user doc)
// ────────────────────────────────────────────────────────────────────────────────
export const requestPasswordReset = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) return;                                  // Don’t reveal existence

  // Generate secure random token
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = await bcrypt.hash(token, SALT_ROUNDS);

  user.resetPassword = {
    tokenHash,
    expiresAt: new Date(Date.now() + RESET_TOKEN_EXP_MIN * 60_000),
  };
  await user.save();

  const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;
  await sendEmail(user.email, 'Reset your password', `Click: ${resetLink}`);
};

// ────────────────────────────────────────────────────────────────────────────────
//  5.  Reset-password   (verify token, set new password)
// ────────────────────────────────────────────────────────────────────────────────
export const resetPassword = async (token: string, newPassword: string) => {
  // Find user whose tokenHash matches & not expired
  const user = await User.findOne({
    'resetPassword.expiresAt': { $gt: new Date() },
  });

  if (
    !user ||
    !(await bcrypt.compare(token, user.resetPassword!.tokenHash))
  ) {
    throw new Error('Invalid or expired token');
  }

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.resetPassword = undefined;                      // clear token
  await user.save();
};
