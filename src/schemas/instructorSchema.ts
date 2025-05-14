import Joi from 'joi';
import { UserRole } from '../models/User';

export const instructorSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid(UserRole.INSTRUCTOR).required(),

  // Application fields
  applicationStatus: Joi.string().valid('pending', 'approved', 'rejected').default('pending'),
  biography: Joi.string().allow('').max(1000),
  expertise: Joi.array().items(Joi.string().max(100)).optional(),
  documents: Joi.array().items(Joi.string()).optional(),

  reviewedAt: Joi.date().optional(),
  reviewNotes: Joi.string().max(1000).optional(),

  sessionId: Joi.string().optional(),
});
