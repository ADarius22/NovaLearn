import { Request, Response } from 'express';
import Course from '../../models/Course';
import { AuthenticatedRequest } from '../../middleware/authMiddleware'; // Ensures proper typing for authenticated requests
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { verifyInputCredentials as verifyInput } from "../../utils/index";
import Instructor from "../../models/Instructor";

export const uploadCourseMaterial = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (req.user?.role !== 'instructor') {
      res.status(403).json({ message: 'Only instructors can upload materials' });
      return;
    }

    const instructorId = req.user._id;

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const course = await Course.findOne({ _id: courseId, createdBy: instructorId });
    if (!course) {
      res.status(404).json({ message: 'Course not found or not owned by you' });
      return;
    }

    // Add the file path to the materials array
    course.materials = [...(course.materials || []), req.file.path];
    await course.save();

    res.status(200).json({ message: 'Material uploaded successfully', materials: course.materials });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};


export const registerInstructor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, biography, expertise, documents } = req.body;

    // Validate input
    verifyInput(email, name, password);

    // Check if email already exists
    const existingInstructor = await Instructor.findOne({ email });
    if (existingInstructor) {
      res.status(400).json({ message: "Email is already registered" });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new instructor
    const newInstructor = new Instructor({
      name,
      email,
      password: hashedPassword,
      biography,
      expertise,
      documents,
      role: "instructor",
      applicationStatus: "pending", // Set application status as pending
      sessionId: uuidv4(),
    });

    // Save the instructor
    await newInstructor.save();

    res.status(201).json({
      message: "Instructor registered successfully. Awaiting admin approval.",
      instructor: newInstructor,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};