import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import instructorRoutes from './routes/usersRoutes/instructorRoutes';
import adminRoutes from './routes/usersRoutes/adminRoutes';
import courseRoutes from './routes/coursesRoutes/courseRoutes';
import studentRoutes from './routes/usersRoutes/studentRoutes';
import quizRoutes from './routes/coursesRoutes/quizRoutes';
import authRoutes from './routes/usersRoutes/authRoutes';
import profileRoutes from './routes/usersRoutes/profileRoutes';


// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

// Initialize the Express app
const app = express();

// Middleware
app.use(express.json());

// User routes
app.use('/api/instructors', instructorRoutes); // Instructor-specific routes
app.use('/api/admin', adminRoutes); // Admin-specific routes
app.use('/api/students', studentRoutes); // Student-specific routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/profile', profileRoutes); // Profile routes

// Course-related routes
app.use('/api/quizzes', quizRoutes); // Quiz routes
app.use('/api/courses', courseRoutes); // Course routes




// Health check route to verify the server is working
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is running smoothly' });
});

// 404 handler (for unknown routes)
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (for uncaught exceptions or errors)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Internal Server Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong, please try again later.' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
