// src/controllers/auth.controller.ts
// ────────────────────────────────────────────────────────────────────────────────
//  Handles registration, login, logout, and password-reset.
//  – Default role on registration = Student
//  – Thin controller that delegates business logic to AuthService
// ────────────────────────────────────────────────────────────────────────────────

import { Request, Response } from 'express';
import AuthService from '../services/auth.service';
import { UserRole } from '../../models/User'; // base collection handle

// -----------------------------------------------------------------------------
//  POST /auth/register
// -----------------------------------------------------------------------------
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // The service hashes the password and returns the safe user DTO
    const user = await AuthService.register({
      name,
      email,
      password,
      role: UserRole.STUDENT, // default – can be overridden by admin workflows
    });

    res.status(201).json({
      message: 'User registered successfully as a student',
      user,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(400).json({ error: (err as Error).message });
  }
};

// -----------------------------------------------------------------------------
//  POST /auth/login
// -----------------------------------------------------------------------------
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // AuthService returns { user, sessionId }
    const { user, sessionId } = await AuthService.login({ email, password });

    // Send sessionId as HTTP-only cookie *and* in the JSON (Postman friendliness)
    res
      .cookie('sessionId', sessionId, { httpOnly: true, sameSite: 'strict' })
      .json({ message: 'Login successful', sessionId, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(400).json({ error: (err as Error).message });
  }
};

// -----------------------------------------------------------------------------
//  POST /auth/logout
// -----------------------------------------------------------------------------
export const logout = async (req: Request, res: Response) => {
  try {
    // Session ID can come from cookie or header
    const sessionId =
      (req.cookies?.sessionId as string | undefined) ||
      (req.headers.sessionid as string | undefined);

    if (!sessionId) {
      res.status(401).json({ error: 'Unauthorized: No session' });
      return;
    }

    await AuthService.logout(sessionId);
    res.clearCookie('sessionId').json({ message: 'Logged out' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
};

// -----------------------------------------------------------------------------
//  POST /auth/forgot-password
// -----------------------------------------------------------------------------
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    await AuthService.requestPasswordReset(email);
    // Always respond 200 to prevent e-mail fishing
    res.json({
      message: 'If that e-mail exists, a reset link has been sent.',
    });
  } catch (err) {
    console.error('Password-reset request error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
};

// -----------------------------------------------------------------------------
//  POST /auth/reset-password
// -----------------------------------------------------------------------------
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    await AuthService.resetPassword(token, newPassword);
    res.json({ message: 'Password updated. You can now log in.' });
  } catch (err) {
    console.error('Password-reset error:', err);
    res.status(400).json({ error: (err as Error).message });
  }
};
