// userRoutes.ts
import { Router } from 'express';
import * as userController from '../../controllers/usersControllers/userControllers';
import * as courseController from '../../controllers/coursesControllers/coursesController';
import * as studentController from '../../controllers/usersControllers/studentController';
import { authenticate, authorizeAdmin, authorizeUser } from '../../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/login', userController.login);
router.post('/register', userController.registerUser);


// Protected routes (Users only)
router.use(authenticate); 

router.get('/users/:userId', userController.getUserById);
router.get('/users', userController.getAllUsers);
router.delete('/users/:userId', authorizeUser(), authorizeAdmin(), userController.deleteUser);



export default router;
