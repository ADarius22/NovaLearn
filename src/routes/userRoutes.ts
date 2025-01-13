import { Router } from 'express';
import * as userController from '../controllers/userController';
import * as authMiddleware from '../middleware/authMiddleware';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' }); 


//register user
router.post('/register', userController.registerUser);

//login user
router.post('/login', userController.loginUser);

//register user as instructor
router.post('/registerInstructor', upload.array('documents'), userController.registerUserAsInstructor);

//register user
router.get('/profile', authMiddleware.authenticate, userController.getUserProfile);

//update user profile
router.put('/profile', authMiddleware.authenticate, userController.updateUserProfile,);

//delete user profile
router.delete('/profile', authMiddleware.authenticate, userController.deleteUserProfile);

//logout user
router.post('/logout', authMiddleware.authenticate, userController.logoutUser);

//promote user to admin
router.put('/promoteToAdmin/:userId',authMiddleware.authenticate, authMiddleware.authorizeAdmin(), userController.promoteUserToAdmin);


export default router;
