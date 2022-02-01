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
  const { error } = schemas.transferBody.validate(body);
  if (error) throw new CustomError(error.message, statusCode.BAD_REQUEST);

  const foundUser = await userModels.findByCpf(user);
  if (!foundUser) throw new CustomError('Bad login data.', statusCode.NOT_FOUND);
  if (foundUser.credit < body.quantity) throw new CustomError('Not enough credit.', statusCode.BAD_REQUEST);

  const makeTransfer = await userModels.addCredit(body.cpf, body.quantity);
  if (!makeTransfer) throw new CustomError('Destiny user not found.', statusCode.NOT_FOUND);

  await userModels.removeCredit(user, body.quantity);
};

const deposit = async (body, user) => {
  const { error } = schemas.depositBody.validate(body, { convert: false });
  if (error) throw new CustomError(error.message, statusCode.BAD_REQUEST);

  const makeDeposit = await userModels.addCredit(user, body.quantity);

  if (!makeDeposit) throw CustomError(`Unable to deposit to ${user}`, statusCode.BAD_REQUEST);
};
module.exports = {
  create,
  login,
  deposit,
  transfer,
};
