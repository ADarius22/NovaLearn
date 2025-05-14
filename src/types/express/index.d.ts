import { UserRole } from '../../models/User';
export {};

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: UserRole;
      sessionId?: string;
    }

    interface Request {
      user?: User;
    }
  }
}
