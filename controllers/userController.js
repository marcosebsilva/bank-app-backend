const userServices = require('../services/userServices');
const statusCode = require('../utils/statusCode.json');

const create = async (req, res, next) => {
  try {
    await userServices.create(req.body);
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const acessToken = await userServices.login(req.body);
    res.status(statusCode.OK).json({ token: acessToken });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  login,
};
