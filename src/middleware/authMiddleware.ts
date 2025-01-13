import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import Instructor, { IInstructor } from '../models/Instructor'; // For instructor-specific validations

// Extend Request interface to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: IUser; // Includes user, admin, or instructor depending on role
}

// Middleware to authenticate users based on session ID
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const sessionId = req.headers.sessionid as string;

  if (!sessionId) {
    res.status(401).json({ error: 'Unauthorized: Missing session ID' });
    return;
  }

  try {
    const user = await User.findOne({ sessionId });

    if (!user) {
      res.status(401).json({ error: 'Unauthorized: Invalid session ID' });
      return;
    }

    req.user = user; // Attach authenticated user to the request object
    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      details: (error as Error).message,
    });
  }
};

// Middleware to authorize admin users
export const authorizeAdmin = () => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};

// Middleware to authorize instructor users
export const authorizeInstructor = () => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== 'instructor') {
      res.status(403).json({ message: 'Access restricted to instructors only' });
      return;
    }

    next();
  };
};

export const authorizeUser = () => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== 'user') {
      res.status(403).json({ message: 'Access restricted to users only' });
      return;
    }

    next();
  };
}

// Middleware to ensure a user has the instructor application approved
export const ensureApprovedInstructor = () => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || req.user.role !== 'instructor') {
      res.status(403).json({ message: 'Access restricted to instructors only' });
      return;
    }

    const instructor = await Instructor.findById(req.user._id);
    if (!instructor || instructor.applicationStatus !== 'approved') {
      res.status(403).json({ message: 'Instructor application not approved' });
      return;
    }

    next();
  };
};
