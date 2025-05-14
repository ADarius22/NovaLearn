import Joi from 'joi';
import { UserRole } from '../models/User';

export const baseUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid(...Object.values(UserRole)).default(UserRole.STUDENT),
  sessionId: Joi.string().optional(),
});
