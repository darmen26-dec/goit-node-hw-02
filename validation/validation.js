const Joi = require('joi');

const baseContactSchema = {
  name: Joi.string().min(2).max(30),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: ['com', 'pl', 'net'],
  }),
  phone: Joi.string()
    .regex(/^\d{3}-\d{3}-\d{3}$/)
    .message({
      'string.pattern.base': `Phone number must be written as 777-777-777.`,
    }),
  favorite: Joi.boolean(),
};

const contactValidator = Joi.object({
  ...baseContactSchema,
  name: baseContactSchema.name.required(),
  email: baseContactSchema.email.required(),
  phone: baseContactSchema.phone.required(),
});

const updateContact = Joi.object(baseContactSchema);

const validate = (schema, body, next) => {
  const { error } = schema.validate(body);
  if (error) {
    const [{ message }] = error.details;
    return next({
      status: 400,
      message: `Field: ${message}`,
    });
  }
  next();
};

const validateContact = (req, res, next) => {
  const { error } = contactValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'missing required fields' });
  }
  next();
};

const contactUpdateValidator = (req, res, next) => {
  const { error } = updateContact.validate(req.body);
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: 'missing fields' });
  }
  if (error) {
    const [{ message }] = error.details;
    return res.status(400).json({ message: message });
  }
  next();
};

const loginAndSignUpSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,30}$/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password must not be more than 30 characters',
      'string.pattern.base':
        'Password must contain at least one uppercase letter and one lowercase letter',
      'any.required': 'Password is required',
    }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
});

module.exports = {
  validateContact,
  contactUpdateValidator,
  loginAndSignUpSchema,
};
