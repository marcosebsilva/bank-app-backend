const bcrypt = require('bcrypt');
const userModels = require('../models/userModels');
const CustomError = require('../utils/CustomError');
const serviceHelpers = require('./serviceHelpers');

const create = async (body) => {
  const bodyIsValid = serviceHelpers.validateRegisterBody(body);
  if (bodyIsValid !== true) throw bodyIsValid;
  const { name, cpf, password } = body;
  const alreadyRegistered = await userModels.findByCpf(cpf);
  if (alreadyRegistered) throw new CustomError('User already registered.', 409);
  const hashedPassword = await bcrypt.hash(password, 10);
  await userModels.create(name, cpf, hashedPassword);
};
module.exports = {
  create,
};
