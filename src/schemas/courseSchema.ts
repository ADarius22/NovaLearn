import Joi from 'joi';

const objectId = Joi.string().regex(/^[a-f\d]{24}$/i).message('Must be a valid MongoDB ObjectId');

export const courseSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),

  description: Joi.string().max(1000).allow('').optional(),

  duration: Joi.number().positive().required(),

  createdBy: objectId.required(),

  instructor: objectId.optional(),

  participants: Joi.array().items(objectId).default([]),

  materials: Joi.array().items(Joi.string().uri().messages({
    'string.uri': 'Each material must be a valid URL or path',
  })).default([]),

  reviews: Joi.array().items(
    Joi.object({
      user: objectId.required(),
      rating: Joi.number().min(1).max(5).required(),
      comment: Joi.string().max(500).optional(),
      createdAt: Joi.date().default(() => new Date()),
    })
  ).default([]),

  progress: Joi.object().pattern(
    objectId,
    Joi.array().items(Joi.string().max(100)) // list of lesson IDs
  ).default({}),

  lessons: Joi.array().items(
    Joi.object({
      lessonId: Joi.string().required(),
      title: Joi.string().required(),
      content: Joi.string().optional(),
    })
  ).default([]),

  quizzes: Joi.array().items(objectId).default([]),
});
