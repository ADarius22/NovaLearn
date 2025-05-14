// src/services/enrollment.service.ts
import Enrollment from '../models/Enrollment';
import Course from '../models/Course';

export const enroll = async (studentId: string, courseId: string) => {
  // Ensure course exists (cheap safeguard)
  const exists = await Course.exists({ _id: courseId });
  if (!exists) throw new Error('Course not found');

  // Unique index prevents duplicates, so just create
  return Enrollment.create({
    student: studentId,
    course: courseId,
    completedLessons: [],
  });
};

export const unenroll = (studentId: string, courseId: string) =>
  Enrollment.findOneAndDelete({ student: studentId, course: courseId });

export const listByStudent = async (
  studentId: string,
  { page = 1, limit = 20 } = {},
) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Enrollment.find({ student: studentId })
      .populate('course')
      .skip(skip)
      .limit(limit)
      .lean(),
    Enrollment.countDocuments({ student: studentId }),
  ]);

  return { page, limit, total, items };
};

export const updateProgress = async (
  studentId: string,
  courseId: string,
  lessonId: string,
) => {
  const enrollment = await Enrollment.findOneAndUpdate(
    {
      student: studentId,
      course: courseId,
      completedLessons: { $ne: lessonId },
    },
    { $push: { completedLessons: lessonId } },
    { new: true, upsert: true },
  ).lean();

  if (!enrollment) throw new Error('Enrollment not found');

  return enrollment.completedLessons;
};
