import { Router } from "express";
import * as adminController from "../../controllers/usersControllers/adminController";
import { authenticate, authorizeAdmin } from "../../middleware/authMiddleware";

const router = Router();

// Middleware to ensure only admins can access these routes
router.use(authenticate, authorizeAdmin());

// Review instructor applications
router.put("/instructors/:userId/review", adminController.reviewInstructorApplication);

// Promote a user to instructor
router.put("/users/:userId/promote", adminController.promoteUserToInstructor);

// Promote a user to admin
router.put("/users/:userId/promote-to-admin", adminController.promoteToAdmin);

export default router;
