const CustomError = require('../utils/CustomError');
const schemas = require('../utils/joi-schemas');
const statusCode = require('../utils/statusCode');

const validateBody = (body) => {
  const { error } = schemas.newUserBody.validate(body);
  if (error) return new CustomError('All fields are required.', statusCode.BAD_REQUEST);
  const { name, cpf, password } = body;
  const validCPF = /^\d{11}$/;
  // thanks to Roko in https://stackoverflow.com/questions/64313880/regular-expression-to-match-exact-11-digits-numbers?noredirect=1&lq=1
  if (!validCPF.test(cpf)) return new CustomError('Invalid CPF format.', statusCode.BAD_REQUEST);
  if (name.length <= 3) return new CustomError('Invalid NAME format.', statusCode.BAD_REQUEST);
  const strongPassword = /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
  if (!strongPassword.test(password)) return new CustomError('Invalid PASSWORD format.', statusCode.BAD_REQUEST);
  return true;
};

module.exports = {
  validateBody,
};
