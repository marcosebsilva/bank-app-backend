const userModels = require('../models/userModels');
const CustomError = require('../utils/CustomError');
const serviceHelpers = require('./serviceHelpers');

const create = async (body) => {
  const bodyIsValid = serviceHelpers.validateBody(body);
  if (bodyIsValid !== true) throw bodyIsValid;
  const { name, cpf } = body;
  const alreadyRegistered = await userModels.findByCpf(cpf);
  if (alreadyRegistered) throw new CustomError('User already registered.', 409);
  await userModels.create(name, cpf);
};
module.exports = {
  create,
};
