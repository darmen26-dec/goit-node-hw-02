const Joi = require('joi');

const baseContactSchema = {
  name: Joi.string().min(3).max(30),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: ['com', 'pl', 'net'],
  }),
  phone: Joi.string()
    .regex(/^\d{3}-\d{3}-\d{3}$/)
    .message({
      'string.pattern.base': `Phone number must be written as 777-777-777.`,
    }),
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

module.exports.contactValidator = (req, res, next) => {
  const { error } = contactValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'missing required fields' });
  }
  next();
};

module.exports.contactUpdateValidator = (req, res, next) => {
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
