import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import userRoutes from './routes/usersRoutes/userRoutes';
import instructorRoutes from './routes/usersRoutes/instructorRoutes';
import adminRoutes from './routes/usersRoutes/adminRoutes';

dotenv.config();

// Connect to the database
connectDB();

// Initialize the Express app
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRoutes); // General user routes
app.use('/api/instructors', instructorRoutes); // Instructor-specific routes
app.use('/api/admin', adminRoutes); // Admin-specific routes

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
