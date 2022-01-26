const bcrypt = require('bcrypt');

const VALID_PASSWORD = '@bananananica25X';

module.exports = {
  VALID_CPF: 15502774651,
  INVALID_CPF: 33345,
  VALID_PASSWORD,
  HASHED_PASSWORD: bcrypt.hash(VALID_PASSWORD, 10),
  INVALID_PASSWORD: 'bananananica',
  VALID_NAME: 'Joaquin Arruda Campos',
  INVALID_NAME: 'tes',
};
