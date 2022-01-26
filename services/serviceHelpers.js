const CustomError = require('../utils/CustomError');
const schemas = require('../utils/joi-schemas');
const statusCode = require('../utils/statusCode.json');

const VALID_CPF_REGEX = /^\d{11}$/;
const STRONG_PASSWORD_REGEX = /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

const validateRegisterBody = (body) => {
  const { error } = schemas.newUserBody.validate(body);
  if (error) return new CustomError('All fields are required.', statusCode.BAD_REQUEST);
  const { name, cpf, password } = body;
  // thanks to Roko in https://stackoverflow.com/questions/64313880/regular-expression-to-match-exact-11-digits-numbers?noredirect=1&lq=1
  if (!VALID_CPF_REGEX.test(cpf)) return new CustomError('Invalid CPF format.', statusCode.BAD_REQUEST);
  if (name.length <= 3) return new CustomError('Invalid NAME format.', statusCode.BAD_REQUEST);
  if (!STRONG_PASSWORD_REGEX.test(password)) return new CustomError('Invalid PASSWORD format.', statusCode.BAD_REQUEST);
  return true;
};

const validateLoginBody = (body) => {
  const { error } = schemas.loginBody.validate(body);

  if (error) return new CustomError('Missing CPF or PASSWORD.', statusCode.BAD_REQUEST);
  const { cpf, password } = body;
  if (!STRONG_PASSWORD_REGEX.test(password)) return new CustomError('Invalid PASSWORD format.', statusCode.BAD_REQUEST);
  if (!VALID_CPF_REGEX.test(cpf)) return new CustomError('Invalid CPF format.', statusCode.BAD_REQUEST);
  return true;
};

module.exports = {
  validateRegisterBody,
  validateLoginBody,
};
