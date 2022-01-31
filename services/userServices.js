const bcrypt = require('bcrypt');
const userModels = require('../models/models');
const CustomError = require('../utils/CustomError');
const statusCode = require('../utils/statusCode.json');
const authService = require('./authService');
const schemas = require('../utils/joi-schemas');

const create = async (body) => {
  const { error } = schemas.newUserBody.validate(body, { convert: false });
  if (error) throw new CustomError(error.message, statusCode.BAD_REQUEST);
  const foundUser = await userModels.findByCpf(body.cpf);
  if (foundUser) throw new CustomError('User already registered.', 409);
  const hashedPassword = await bcrypt.hash(body.password, 10);
  await userModels.create(body.name, body.cpf, hashedPassword);
};

const login = async (body) => {
  const { error } = schemas.loginBody.validate(body, { convert: false });
  if (error) throw new CustomError(error.message, statusCode.BAD_REQUEST);
  const foundUser = await userModels.findByCpf(body.cpf);
  if (!foundUser) throw new CustomError('User not found.', statusCode.NOT_FOUND);
  const checkPassword = await bcrypt.compare(body.password, foundUser.account_owner.password);
  if (!checkPassword) throw new CustomError('Wrong password.', statusCode.UNAUTHORIZED);

  const { password, ...verifiedUser } = foundUser.account_owner;

  const accessToken = authService.generateToken(verifiedUser);

  return accessToken;
};

const transfer = async (body, user) => {
  const { error } = schemas.depositBody.validate(body);
  if (error) throw new CustomError(error.message, 400);

  const foundUser = await userModels.findByCpf(user);
  if (foundUser.credit < body.quantity) throw new CustomError('Not enough credit.', 400);

  const makeTransfer = await userModels.addCredit(body.cpf, body.quantity);
  if (!makeTransfer.insertedId) throw new CustomError('Destiny user not found.', 404);

  await userModels.removeCredit(user, body.quantity);
};
module.exports = {
  create,
  login,
  transfer,
};
