// src/services/instructor.service.ts
// ────────────────────────────────────────────────────────────────────────────────
//  All instructor-centric DB helpers.
//
//  • applyForInstructor   – student submits an application
//  • getStatus            – pending / approved / rejected info for “My Profile”
//  • listMyCoursesStats   – simple per-course enrollment & rating counts
//
//  Promotion / approval is handled in admin.service.ts.
// ────────────────────────────────────────────────────────────────────────────────

import {User, Instructor, IInstructor, UserRole } from '../models/User';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';

interface ApplicationPayload {
  biography?: string;
  expertise?: string[];
  documents?: string[]; // file-id or URL strings
}

/* ───────────────────────── 1. Apply for instructor ────────────────────────── */
export const applyForInstructor = async (
  userId: string,
  payload: ApplicationPayload,
) => {
  // Start with the *base* User model to find the student document
  const user = await User.findById(userId);

  if (!user) throw new Error('User not found');
  if (user.role !== UserRole.STUDENT)
    throw new Error('Already an instructor or admin');

  // Cast so TypeScript allows instructor-specific fields
  const applicant = user as unknown as IInstructor;

  applicant.role = UserRole.INSTRUCTOR;
  applicant.applicationStatus = 'pending';
  applicant.biography  = payload.biography;
  applicant.expertise  = payload.expertise;
  applicant.documents  = payload.documents;

  await applicant.save();
  return { status: applicant.applicationStatus };
};

// ────────────────────────────────────────────────────────────────────────────────
//  2.  Instructor checks application status
// ────────────────────────────────────────────────────────────────────────────────
export const getStatus = async (userId: string) => {
  const user = await Instructor.findById(userId)
    .select('applicationStatus reviewedAt reviewNotes')
    .lean();

  if (!user || user.role !== UserRole.INSTRUCTOR)
    throw new Error('Not an instructor');

  return {
    status: user.applicationStatus || 'pending',
    reviewedAt: user.reviewedAt,
    notes: user.reviewNotes,
  };
};

// ────────────────────────────────────────────────────────────────────────────────
//  3.  Dashboard analytics – enrollments & avg rating per course
// ────────────────────────────────────────────────────────────────────────────────
export const listMyCoursesStats = async (instructorId: string) => {
  // Fetch courses authored by instructor
  const courses = await Course.find({ instructor: instructorId })
    .select('_id title slug')
    .lean();

  // Gather enrollment counts in one aggregation
  const courseIds = courses.map((c) => c._id);
  const enrollStats = await Enrollment.aggregate([
    { $match: { course: { $in: courseIds } } },
    { $group: { _id: '$course', students: { $sum: 1 } } },
  ]);

  const enrollMap = new Map(enrollStats.map((e) => [e._id.toString(), e.students]));

  return courses.map((c) => ({
    ...c,
    students: enrollMap.get(c._id.toString()) || 0,
    // ratingAvg could be added if you have a Review collection
  }));
};
