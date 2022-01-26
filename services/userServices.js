const userModels = require('../models/userModels');
const serviceHelpers = require('./serviceHelpers');

const create = async (body) => {
  const bodyIsValid = serviceHelpers.validateBody(body);
  if (bodyIsValid !== true) throw bodyIsValid;
  const { name, cpf } = body;
  await userModels.create(name, cpf);
};
module.exports = {
  create,
};
