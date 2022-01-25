const userServices = require('../services/userServices');

const create = async (req, res, next) => {
  try {
    await userServices.create(req.body);
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
};
