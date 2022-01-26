const CustomError = require('../utils/CustomError');
const schemas = require('../utils/joi-schemas');
const statusCode = require('../utils/statusCode.json');

const validateBody = (body) => {
  const { error } = schemas.newUserBody.validate(body);
  if (error) throw new CustomError('Missing CPF or NAME field.', statusCode.BAD_REQUEST);
  const { name, cpf } = body;
  const validCPF = /^\d{11}$/;
  // thanks to Roko in https://stackoverflow.com/questions/64313880/regular-expression-to-match-exact-11-digits-numbers?noredirect=1&lq=1
  if (!validCPF.test(cpf)) throw new CustomError('Invalid CPF format.', statusCode.BAD_REQUEST);
  if (name.length <= 3) throw new CustomError('Invalid NAME format.', statusCode.BAD_REQUEST);
};

module.exports = {
  validateBody,
};
