require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_CONFIG = {
  expiresIn: '1h',
  algorithm: 'HS256',
};

const generateToken = (data) => jwt.sign({ data }, process.env.JWT_SECRET_KEY, JWT_CONFIG);

const verifyToken = (token) => {
  try {
    const verifiedAcess = jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) return null;
      return decoded.data.cpf;
    });
    return verifiedAcess;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
