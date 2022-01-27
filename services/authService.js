require('dotenv').config();
const jwt = require('jsonwebtoken');

const generateToken = (data) => jwt.sign({ data }, process.env.JWT_SECRET_KEY);

module.exports = {
  generateToken,
};
