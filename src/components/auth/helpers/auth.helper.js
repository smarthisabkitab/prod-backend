import Joi from "joi";

export const loginHelper = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const registerHelper = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string()
    .valid("subscriber", "editor", "admin", "worker")
    .default("subscriber"),
  phone_no: Joi.string().required(),
  address: Joi.string().required(),
  is_deleted: Joi.boolean().default(false),
  last_login: Joi.date().default(() => new Date()),
});
