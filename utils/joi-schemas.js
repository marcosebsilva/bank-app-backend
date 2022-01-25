const Joi = require('joi');

const newUserBody = Joi.object({
  cpf: Joi.number()
    .required(),
  name: Joi.string()
    .required(),
});

module.exports = {
  newUserBody,
};