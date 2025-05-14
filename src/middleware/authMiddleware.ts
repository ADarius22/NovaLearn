import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import {User, UserRole, Instructor } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret';

// Base auth – every route that needs login
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
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
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Only admin
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Admin access only' });
  }
  next();
};

// Only instructor
export const authorizeInstructor = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== UserRole.INSTRUCTOR) {
    return res.status(403).json({ error: 'Instructor access only' });
  }
  next();
};

// Only student
export const authorizeStudent = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== UserRole.STUDENT) {
    return res.status(403).json({ error: 'Student access only' });
  }
  next();
};

// Instructor must be approved
export const ensureApprovedInstructor = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== UserRole.INSTRUCTOR) {
    return res.status(403).json({ error: 'Instructor access only' });
  }

  try {
    const instructor = await Instructor.findById(req.user.id).select('applicationStatus');

    if (!instructor || instructor.applicationStatus !== 'approved') {
      return res.status(403).json({ error: 'Instructor not approved yet' });
    }

    next();
  } catch {
    return res.status(500).json({ error: 'Could not validate instructor status' });
  }
};
