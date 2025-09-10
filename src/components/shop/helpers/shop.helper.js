import Joi from "joi";

export const createShopValidate = Joi.object({
  user_id: Joi.number().integer().required(),
  shop_name: Joi.string().required(),
  status: Joi.valid("active", "inactive").default("active"),
  settings: Joi.object().allow(null),
});

export const updateShopValidate = Joi.object({
  shop_name: Joi.string().optional(),
  settings: Joi.object().allow(null).optional(),
  status: Joi.object().valid("active", "inactive").optional(),
}).min(1);
