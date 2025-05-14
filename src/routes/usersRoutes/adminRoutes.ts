import { Router } from 'express';
import {
  listUsers,
  promoteToInstructor,
  approveInstructor,
  revokeInstructor,
  promoteToAdmin,
} from '../../controllers/usersControllers/adminController';
import { authenticate, authorizeAdmin } from '../../middleware/authMiddleware';
import type { RequestHandler } from 'express';

const router = Router();

// All routes below are restricted to admins only
router.use(authenticate, authorizeAdmin);

// GET /admin/users?role=student|instructor&search=...
router.get('/users', listUsers);

// PATCH /admin/promote/instructor/:id
router.patch('/promote/instructor/:id', promoteToInstructor);

// PATCH /admin/approve/instructor/:id
router.patch('/approve/instructor/:id', approveInstructor);

// PATCH /admin/revoke/instructor/:id
router.patch('/revoke/instructor/:id', revokeInstructor);

// PATCH /admin/promote/admin/:id
router.patch('/promote/admin/:id', promoteToAdmin);

export default router;
