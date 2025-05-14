// src/controllers/instructor.controller.ts
// ────────────────────────────────────────────────────────────────────────────────
//  Endpoints ONLY instructors can hit
//  – Application workflow  : apply → check-status
//  – Course management     : list-mine, create, update, delete
//  (Route-level guard `authorizeInstructor` + `ensureApprovedInstructor` protects
//   most endpoints. Only /apply and /status bypass the “approved” check.)
// ────────────────────────────────────────────────────────────────────────────────

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import InstructorService from '../services/instructor.service';
import CourseService from '../services/course.service';
import { UserRole } from '../../models/User'; // base collection handle

// ────────────────────────────────────────────────────────────────────────────────
//  1.  Instructor application flow
// ────────────────────────────────────────────────────────────────────────────────

// POST /instructor/apply    – student ➜ instructor-applicant
export const applyToTeach = async (req: AuthenticatedRequest, res: Response) => {
  // Optional extra fields: biography, expertise, documents (IDs for uploads)
  const application = await InstructorService.apply(req.user!.id, req.body);
  res.status(202).json({
    message:
      'Application submitted. You will receive an email when it is reviewed.',
    application,
  });
};

// GET /instructor/status    – check my application status
export const getApplicationStatus = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { status, reviewedAt, notes } = await InstructorService.getStatus(
    req.user!.id,
  );
  res.json({ status, reviewedAt, notes });
};

// ────────────────────────────────────────────────────────────────────────────────
//  2.  Course management (requires APPROVED instructor)
// ────────────────────────────────────────────────────────────────────────────────

// GET /instructor/courses   – list my own courses (paginated)
export const listMyCourses = async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 20 } = req.query as Record<string, string>;
  const result = await CourseService.listByInstructor(req.user!.id, {
    page: Number(page),
    limit: Number(limit),
  });
  res.json(result);
};

// POST /instructor/courses  – create a new course
export const createCourse = async (req: AuthenticatedRequest, res: Response) => {
  const course = await CourseService.create({
    ...req.body,
    instructor: req.user!.id,
  });
  res.status(201).json(course);
};

// PATCH /instructor/courses/:id
export const updateCourse = async (req: AuthenticatedRequest, res: Response) => {
  const course = await CourseService.updateOwnedCourse(
    req.params.id,
    req.user!.id,
    req.body,
  );
  res.json(course);
};

// DELETE /instructor/courses/:id
export const deleteCourse = async (req: AuthenticatedRequest, res: Response) => {
  await CourseService.deleteOwnedCourse(req.params.id, req.user!.id);
  res.status(204).send();
};
