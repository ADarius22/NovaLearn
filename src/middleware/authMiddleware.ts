import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { User, UserRole, Instructor } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret';

// ─────────────────────────────────────────────────────────────
// Authenticate middleware
// ─────────────────────────────────────────────────────────────

export const authenticate: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: UserRole;
      sessionId?: string;
    };

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
};

// ─────────────────────────────────────────────────────────────
// Role-based middleware
// ─────────────────────────────────────────────────────────────

export const authorizeAdmin: RequestHandler = (req, res, next) => {
  if (req.user?.role !== UserRole.ADMIN) {
    res.status(403).json({ error: 'Admin access only' });
    return;
  }
  next();
};

export const authorizeInstructor: RequestHandler = (req, res, next) => {
  if (req.user?.role !== UserRole.INSTRUCTOR) {
    res.status(403).json({ error: 'Instructor access only' });
    return;
  }
  next();
};

export const authorizeStudent: RequestHandler = (req, res, next) => {
  if (req.user?.role !== UserRole.STUDENT) {
    res.status(403).json({ error: 'Student access only' });
    return;
  }
  next();
};

// ─────────────────────────────────────────────────────────────
// Ensure instructor is approved
// ─────────────────────────────────────────────────────────────

export const ensureApprovedInstructor: RequestHandler = async (req, res, next) => {
  if (req.user?.role !== UserRole.INSTRUCTOR) {
    res.status(403).json({ error: 'Instructor access only' });
    return;
  }

  try {
    const instructor = await Instructor.findById(req.user.id).select('applicationStatus');
    if (!instructor || instructor.applicationStatus !== 'approved') {
      res.status(403).json({ error: 'Instructor not approved yet' });
      return;
    }

    next();
  } catch {
    res.status(500).json({ error: 'Could not validate instructor status' });
    return;
  }
};
