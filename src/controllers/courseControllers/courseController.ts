import { Request, Response } from 'express';
import * as courseService from '../../services/courseService';

// ────────────────────────────────────────────────────────────────────────────────
//  PUBLIC CATALOGUE
// ────────────────────────────────────────────────────────────────────────────────

export const getPublicCourses = async (req: Request, res: Response): Promise<void> => {
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
    return;
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch courses' });
    return;
  }
};

export const getCourseDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const course = await courseService.getCourseByIdOrSlug(id);

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    res.status(200).json(course);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve course' });
    return;
  }
};

// ────────────────────────────────────────────────────────────────────────────────
//  INSTRUCTOR MANAGEMENT
// ────────────────────────────────────────────────────────────────────────────────

export const getInstructorCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const instructorId = req.user?.id;
    if (!instructorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { page, limit } = req.query;

    const courses = await courseService.fetchInstructorCourses(instructorId, {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });

    res.status(200).json(courses);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch instructor courses' });
    return;
  }
};

export const createInstructorCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const instructorId = req.user?.id;
    if (!instructorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const course = await courseService.createCourseForInstructor({
      ...req.body,
      instructor: instructorId,
    });

    res.status(201).json(course);
    return;
  } catch (err) {
    res.status(400).json({ error: 'Course creation failed' });
    return;
  }
};

export const updateInstructorCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const instructorId = req.user?.id;
    const { id } = req.params;
    if (!instructorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const updated = await courseService.updateInstructorCourse(id, instructorId, req.body);

    if (!updated) {
      res.status(404).json({ error: 'Course not found or not owned by you' });
      return;
    }

    res.status(200).json(updated);
    return;
  } catch (err) {
    res.status(400).json({ error: 'Failed to update course' });
    return;
  }
};

export const deleteInstructorCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const instructorId = req.user?.id;
    const { id } = req.params;
    if (!instructorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const deleted = await courseService.deleteInstructorCourse(id, instructorId);

    if (!deleted) {
      res.status(404).json({ error: 'Course not found or not owned by you' });
      return;
    }

    res.status(204).send();
    return;
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete course' });
    return;
  }
};
