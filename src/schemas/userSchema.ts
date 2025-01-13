import Joi from 'joi';

export const userSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    'string.base': 'Name should be a type of text',
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name should have a minimum length of 3',
    'any.required': 'Name is a required field',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email',
    'any.required': 'Email is a required field',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password should have a minimum length of 6',
    'any.required': 'Password is a required field',
  }),
  role: Joi.string().valid('user', 'instructor', 'admin').default('user').messages({
    'any.only': 'Role must be one of [user, instructor, admin]',
  }),
});
