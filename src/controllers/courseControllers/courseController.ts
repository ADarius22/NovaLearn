import { Request, Response } from 'express';
import * as courseService from '../../services/courseService';

// ────────────────────────────────────────────────────────────────────────────────
//  PUBLIC CATALOGUE
// ────────────────────────────────────────────────────────────────────────────────

export const getPublicCourses = async (req: Request, res: Response) => {
  try {
    const { search, category, page, limit, sort } = req.query;

    const result = await courseService.fetchPublicCourses({
      search: String(search || ''),
      category: String(category || ''),
      page: Number(page) || 1,
      limit: Number(limit) || 12,
      sort: String(sort || 'createdAt'),
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch courses' });
  }
};

export const getCourseDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await courseService.getCourseByIdOrSlug(id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve course' });
  }
};

// ────────────────────────────────────────────────────────────────────────────────
//  INSTRUCTOR MANAGEMENT
// ────────────────────────────────────────────────────────────────────────────────

export const getInstructorCourses = async (req: Request, res: Response) => {
  try {
    const instructorId = req.user?.id;
    if (!instructorId) return res.status(401).json({ error: 'Unauthorized' });

    const { page, limit } = req.query;

    const courses = await courseService.fetchInstructorCourses(instructorId, {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });

    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch instructor courses' });
  }
};

export const createInstructorCourse = async (req: Request, res: Response) => {
  try {
    const instructorId = req.user?.id;
    if (!instructorId) return res.status(401).json({ error: 'Unauthorized' });

    const course = await courseService.createCourseForInstructor({
      ...req.body,
      instructor: instructorId,
    });

    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: 'Course creation failed' });
  }
};

export const updateInstructorCourse = async (req: Request, res: Response) => {
  try {
    const instructorId = req.user?.id;
    const { id } = req.params;
    if (!instructorId) return res.status(401).json({ error: 'Unauthorized' });

    const updated = await courseService.updateInstructorCourse(id, instructorId, req.body);

    if (!updated) return res.status(404).json({ error: 'Course not found or not owned by you' });

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update course' });
  }
};

export const deleteInstructorCourse = async (req: Request, res: Response) => {
  try {
    const instructorId = req.user?.id;
    const { id } = req.params;
    if (!instructorId) return res.status(401).json({ error: 'Unauthorized' });

    const deleted = await courseService.deleteInstructorCourse(id, instructorId);

    if (!deleted) return res.status(404).json({ error: 'Course not found or not owned by you' });

    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete course' });
  }
};
