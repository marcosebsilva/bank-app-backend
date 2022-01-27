const bcrypt = require('bcrypt');
const userModels = require('../models/userModels');
const CustomError = require('../utils/CustomError');
const serviceHelpers = require('./serviceHelpers');
const statusCode = require('../utils/statusCode.json');
const authService = require('./authService');

const create = async (body) => {
  const bodyIsValid = serviceHelpers.validateRegisterBody(body);
  if (bodyIsValid !== true) throw bodyIsValid;
  const foundUser = await userModels.findByCpf(body.cpf);
  if (foundUser) throw new CustomError('User already registered.', 409);
  const hashedPassword = await bcrypt.hash(body.password, 10);
  await userModels.create(body.name, body.cpf, hashedPassword);
};

const login = async (body) => {
  const bodyIsValid = serviceHelpers.validateLoginBody(body);
  if (bodyIsValid !== true) throw bodyIsValid;
  const { account_owner: accountOwner } = await userModels.findByCpf(body.cpf);
  if (!accountOwner) throw new CustomError('User not found.', statusCode.NOT_FOUND);
  const checkPassword = await bcrypt.compare(body.password, accountOwner.password);
  if (!checkPassword) throw new CustomError('Wrong password.', statusCode.UNAUTHORIZED);

  const { password, ...verifiedUser } = accountOwner;

  const accessToken = authService.generateToken(verifiedUser);

  return accessToken;
};
module.exports = {
  create,
  login,
};
