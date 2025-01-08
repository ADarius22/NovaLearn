import Joi from 'joi';

export const courseSchema = Joi.object({
  title: Joi.string().min(3).max(50).required().messages({
    'string.base': 'Title should be a type of text',
    'string.empty': 'Title cannot be empty',
    'string.min': 'Title should have a minimum length of 3',
    'any.required': 'Title is a required field',
  }),
  description: Joi.string().max(200).optional().messages({
    'string.max': 'Description should not exceed 200 characters',
  }),
  duration: Joi.number().positive().required().messages({
    'number.base': 'Duration must be a positive number',
    'any.required': 'Duration is a required field',
  }),
});
