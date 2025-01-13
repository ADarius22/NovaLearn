import Joi from 'joi';
import { userSchema } from './userSchema';

export const adminSchema = userSchema.keys({
  // Add admin-specific fields if required
});
