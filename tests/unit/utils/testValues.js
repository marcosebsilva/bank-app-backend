const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'ME_VERY_SECURE';
const VALID_PASSWORD = '@bananananica25X';
const exampleToken = jwt.sign('foo', SECRET_KEY);

module.exports = {
  SECRET_KEY,
  EXAMPLE_TOKEN: exampleToken,
  VALID_CPF: 15502774651,
  INVALID_CPF: 33345,
  VALID_PASSWORD,
  HASHED_PASSWORD: bcrypt.hash(VALID_PASSWORD, 10),
  INVALID_PASSWORD: 'bananananica',
  VALID_NAME: 'Joaquin Arruda Campos',
  INVALID_NAME: 'tes',
};
