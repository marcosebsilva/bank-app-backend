const CustomError = require('../utils/CustomError');
const schemas = require('../utils/joi-schemas');
const statusCode = require('../utils/statusCode.json');
const userModels = require('../models/userModels');

const create = async () => {

};
const validateBody = async (body) => {
  const { error } = schemas.newUserBody.validate(body);
  if (error) throw new CustomError('Missing CPF or NAME field.', statusCode.BAD_REQUEST);
  const { name, cpf } = body;
  const validCPF = /^\d{11}$/;
  // thanks to Roko in https://stackoverflow.com/questions/64313880/regular-expression-to-match-exact-11-digits-numbers?noredirect=1&lq=1
  if (!validCPF.test(cpf)) throw new CustomError('Invalid CPF format.', statusCode.BAD_REQUEST);
  if (name.length <= 3) throw new CustomError('Invalid NAME format.', statusCode.BAD_REQUEST);

  const alreadyExists = await userModels.findByCpf(cpf);
  if (alreadyExists) throw new CustomError('User already registered.', statusCode.ALREADY_REGISTERED);
};
module.exports = {
  create,
  validateBody,
};
