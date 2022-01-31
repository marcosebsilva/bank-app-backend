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

const transfer = async (req, res, next) => {
  try {
    await userServices.transfer(req.body, req.user);
    res.sendStatus(statusCode.OK);
  } catch (error) {
    next(error);
  }
};

const deposit = async (req, res, next) => {
  try {
    await userServices.deposit(req.body, req.user);
    res.sendStatus(statusCode.OK);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  create,
  login,
  transfer,
  deposit,
};
