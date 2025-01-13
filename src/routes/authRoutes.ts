import { Router } from 'express';
import * as authController from '../controllers/authController';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' }); // Configure file uploads

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/registerInstructor', upload.array('documents'), authController.registerInstructor);

export default router;
