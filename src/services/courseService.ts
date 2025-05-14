import Course, { ICourse } from '../models/Course';
import { Types } from 'mongoose';

interface PublicCourseQueryOptions {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
}

// ────────────────────────────────────────────────────────────────────────────────
//  Public Catalogue Access
// ────────────────────────────────────────────────────────────────────────────────

export const fetchPublicCourses = async ({
  search = '',
  category,
  page = 1,
  limit = 12,
  sort = 'createdAt',
}: PublicCourseQueryOptions) => {
  const filters: Record<string, unknown> = {};
  if (search) filters.title = { $regex: search, $options: 'i' };
  if (category) filters.category = category;

  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    Course.find(filters)
      .populate('instructor', 'name')
      .sort({ [sort]: -1 as 1 | -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Course.countDocuments(filters),
  ]);

  return { page, limit, total, items: courses };
};

export const getCourseByIdOrSlug = (idOrSlug: string) => {
  const query = Types.ObjectId.isValid(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug };

  return Course.findOne(query)
    .populate('instructor', 'name')
    .lean();
};

// ────────────────────────────────────────────────────────────────────────────────
//  Instructor Course Management
// ────────────────────────────────────────────────────────────────────────────────

export const fetchInstructorCourses = (
  instructorId: string,
  { page = 1, limit = 20 }: PaginationOptions,
) => {
  const skip = (page - 1) * limit;

  return Course.find({ instructor: instructorId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

export const createCourseForInstructor = (
  payload: Partial<ICourse> & { instructor: string }
) => {
  return Course.create(payload);
};

export const updateInstructorCourse = (
  courseId: string,
  instructorId: string,
  updates: Partial<ICourse>
) => {
  return Course.findOneAndUpdate(
    { _id: courseId, instructor: instructorId },
    updates,
    { new: true, runValidators: true }
  ).lean();
};

export const deleteInstructorCourse = (
  courseId: string,
  instructorId: string
) => {
  return Course.findOneAndDelete({ _id: courseId, instructor: instructorId });
};
