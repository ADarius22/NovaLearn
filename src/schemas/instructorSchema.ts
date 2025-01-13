import Joi from 'joi';
import { userSchema } from './userSchema';

export const instructorSchema = userSchema.keys({
  biography: Joi.string().max(500).optional().messages({
    'string.max': 'Biography should not exceed 500 characters',
  }),
  expertise: Joi.string().max(200).optional().messages({
    'string.max': 'Expertise should not exceed 200 characters',
  }),
  documents: Joi.array().items(Joi.string()).optional().messages({
    'array.base': 'Documents should be an array of strings',
  }),
  applicationStatus: Joi.string().valid('pending', 'approved', 'rejected').optional().messages({
    'any.only': 'Application status must be one of [pending, approved, rejected]',
  }),
});
