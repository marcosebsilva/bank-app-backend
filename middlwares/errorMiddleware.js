// eslint-disable-next-line no-unused-vars
const errorMiddleware = async (err, _req, res, _next) => {
  const { message, status } = err;
  res.status(status).json({ message });
};

module.exports = errorMiddleware;
