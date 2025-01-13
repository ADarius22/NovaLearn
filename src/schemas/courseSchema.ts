import Joi from 'joi';

export const courseSchema = Joi.object({
  title: Joi.string().min(3).max(50).required().messages({
    'string.base': 'Title should be a type of text',
    'string.empty': 'Title cannot be empty',
    'string.min': 'Title should have a minimum length of 3',
    'string.max': 'Title should not exceed 50 characters',
    'any.required': 'Title is a required field',
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': 'Description should not exceed 500 characters',
  }),
  duration: Joi.number().positive().required().messages({
    'number.base': 'Duration must be a positive number',
    'any.required': 'Duration is a required field',
  }),
  createdBy: Joi.string().regex(/^[a-f\d]{24}$/i).required().messages({
    'string.base': 'CreatedBy should be a valid instructor ID',
    'string.pattern.base': 'CreatedBy must be a valid 24-character MongoDB ObjectID',
    'any.required': 'CreatedBy is a required field',
  }),
  participants: Joi.array().items(
    Joi.string().regex(/^[a-f\d]{24}$/i).messages({
      'string.base': 'Participant ID should be a valid MongoDB ObjectID',
    })
  ).default([]),
  materials: Joi.array().items(Joi.string()).default([]).messages({
    'array.base': 'Materials should be an array of strings representing file paths or URLs',
  }),
  category: Joi.string().valid('Programming', 'Design', 'Marketing', 'Business').optional().messages({
    'any.only': 'Category must be one of [Programming, Design, Marketing, Business]',
  }),
  tags: Joi.array().items(Joi.string().max(30)).default([]).messages({
    'array.base': 'Tags should be an array of strings',
    'string.max': 'Each tag should not exceed 30 characters',
  }),
  reviews: Joi.array()
    .items(
      Joi.object({
        userId: Joi.string().regex(/^[a-f\d]{24}$/i).required().messages({
          'string.base': 'User ID should be a valid string',
          'string.pattern.base': 'User ID must be a valid 24-character MongoDB ObjectID',
          'any.required': 'User ID is required for reviews',
        }),
        rating: Joi.number().min(1).max(5).required().messages({
          'number.base': 'Rating must be a number',
          'number.min': 'Rating must be at least 1',
          'number.max': 'Rating must not exceed 5',
          'any.required': 'Rating is required',
        }),
        comment: Joi.string().max(500).optional().messages({
          'string.max': 'Comment should not exceed 500 characters',
        }),
        createdAt: Joi.date().default(() => new Date()),
      })
    )
    .default([]),
  progress: Joi.object().pattern(
    Joi.string().regex(/^[a-f\d]{24}$/i),
    Joi.array().items(Joi.string())
  ).default({}),
  instructor: Joi.string().regex(/^[a-f\d]{24}$/i).required().messages({
    'string.base': 'Instructor should be a valid MongoDB ObjectID',
    'any.required': 'Instructor is a required field',
  }),
});
