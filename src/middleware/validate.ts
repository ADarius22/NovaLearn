import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      res.status(400).json({
        error: 'Validation error',
        details: error.details.map((d) => d.message),
      });
      return; // explicitly return to satisfy void
    }

    next(); // move forward
  };
};

export const validateQuiz = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional(),
    course: Joi.string().regex(/^[a-f\d]{24}$/i).required(), // Validate MongoDB ObjectId format
    instructor: Joi.string().regex(/^[a-f\d]{24}$/i).required(),
    questions: Joi.array().items(
      Joi.object({
        text: Joi.string().required(),
        options: Joi.array().items(Joi.string().required()).required(),
        correctAnswer: Joi.string().required(),
      })
    ).required(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false }); // Validate and collect all errors

  if (error) {
    res.status(400).json({ error: 'Validation error', details: error.details.map(d => d.message) });
    return;
  }

  next(); // Move to the next middleware if validation passes
};

export default validate;
