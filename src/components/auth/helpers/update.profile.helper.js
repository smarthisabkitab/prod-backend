import Joi from "joi";

export const editProfileSchema = Joi.object({
  fullname: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone_no: Joi.string().optional(),
});

export const updatePasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).optional(),
  oldPassword: Joi.string().optional(),
});
