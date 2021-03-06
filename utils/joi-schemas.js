const Joi = require('joi');

const cpfMessages = {
  'string.base': 'CPF must be a string.',
  'string.pattern.base': 'Invalid CPF format.',
  'string.required': 'CPF is required.',
  'string.length': 'CPF length must be exactly 11 characters.',
};

const nameMessages = {
  'string.base': 'NAME must be a string.',
  'string.min': 'NAME length must be at least 4 characters long.',
  'string.required': 'NAME is required.',
};

const passwordMessages = {
  'string.base': 'PASSWORD must be a string.',
  'string.pattern.base': 'Bad PASSWORD format.',
  'string.required': 'PASSWORD is required.',
};

const quantityMessages = {
  'number.base': 'Quantity must be a number.',
  'any.required': 'Quantity is required.',
  'number.positive': 'Negative values not allowed.',
};

const newUserBody = Joi.object({
  cpf: Joi.string()
    .pattern(/^[0-9]*$/)
    .length(11)
    .required()
    .messages(cpfMessages),
  name: Joi.string()
    .required()
    .min(4)
    .messages(nameMessages),
  password: Joi.string()
    .required()
    .pattern(/(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
    .messages(passwordMessages),
});

const loginBody = Joi.object({
  cpf: Joi.string()
    .required()
    .messages(cpfMessages),
  password: Joi.string()
    .required()
    .messages(passwordMessages),
});

const transferBody = Joi.object({
  cpf: Joi.string()
    .required()
    .messages(cpfMessages),
  quantity: Joi.number()
    .positive()
    .required()
    .messages(quantityMessages),
});

const depositBody = Joi.object({
  quantity: Joi.number()
    .max(2000)
    .positive()
    .required()
    .messages(quantityMessages),
});

module.exports = {
  newUserBody,
  loginBody,
  transferBody,
  depositBody,
};
