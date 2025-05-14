import { Request, Response } from 'express';
import * as AuthService from '../../services/authService';
import { UserRole } from '../../models/User';

// ─────────────────────────────────────────────────────────────
// POST /auth/register
// ─────────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const user = await AuthService.register({
      name,
      email,
      password,
      role: UserRole.STUDENT,
    });

    res.status(201).json({
      message: 'User registered successfully as a student',
      user,
    });
  } catch (err) {
    console.error('[Auth] Register error:', err);
    res.status(400).json({ error: (err as Error).message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /auth/login
// ─────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { user, sessionId } = await AuthService.login({ email, password });

    res
      .cookie('sessionId', sessionId, { httpOnly: true, sameSite: 'strict' })
      .status(200)
      .json({ message: 'Login successful', sessionId, user });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(400).json({ error: (err as Error).message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /auth/logout
// ─────────────────────────────────────────────────────────────
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId =
      (req.cookies?.sessionId as string | undefined) ||
      (req.headers.sessionid as string | undefined);

    if (!sessionId) {
      res.status(401).json({ error: 'Unauthorized: No session ID provided' });
      return;
    }

    await AuthService.logout(sessionId);
    res.clearCookie('sessionId', { httpOnly: true }).status(200).json({ message: 'Logged out' });
  } catch (err) {
    console.error('[Auth] Logout error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
};


// ─────────────────────────────────────────────────────────────
// POST /auth/forgot-password
// ─────────────────────────────────────────────────────────────
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    await AuthService.requestPasswordReset(email);

    res.status(200).json({
      message: 'If that email exists, a reset link has been sent.',
    });
  } catch (err) {
    console.error('[Auth] Password-reset request error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /auth/reset-password
// ─────────────────────────────────────────────────────────────
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    await AuthService.resetPassword(token, newPassword);

    res.status(200).json({ message: 'Password updated. You can now log in.' });
  } catch (err) {
    console.error('[Auth] Password-reset error:', err);
    res.status(400).json({ error: (err as Error).message });
  }
};
