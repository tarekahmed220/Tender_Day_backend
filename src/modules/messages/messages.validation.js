import Joi from "joi";

const messageValidation = Joi.object({
  name: Joi.string().required().messages({
    "string.base": "Name must be a string.",
    "string.empty": "Name cannot be empty.",
    "any.required": "Name is required.",
  }),
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string.",
    "string.email": "Email must be a valid email address.",
    "string.empty": "Email cannot be empty.",
    "any.required": "Email is required.",
  }),
  country: Joi.string().required().messages({
    "string.base": "Country must be a string.",
    "string.empty": "Country cannot be empty.",
    "any.required": "Country is required.",
  }),
  phone: Joi.string().required().messages({
    "string.base": "Phone must be a string.",
    "string.empty": "Phone cannot be empty.",
    "any.required": "Phone is required.",
  }),
  message: Joi.string().required().messages({
    "string.base": "Message must be a string.",
    "string.empty": "Message cannot be empty.",
    "any.required": "Message is required.",
  }),
  createdAt: Joi.date().optional().messages({
    "date.base": "Created At must be a valid date.",
  }),
  isDeleted: Joi.boolean().optional().messages({
    "boolean.base": "Is Deleted must be a boolean value.",
  }),
});

export default messageValidation;
