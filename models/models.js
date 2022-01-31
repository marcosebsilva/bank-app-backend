const connection = require('./connection');

const create = async (name, cpf, password) => {
  const conn = await connection();
  const query = await conn.collection('users').insertOne({
    account_owner: {
      name,
      cpf,
      password,
    },
    credit: 0,
  });
  return query;
};

const findByCpf = async (cpf) => {
  const conn = await connection();
  const query = await conn.collection('users').findOne({ 'account_owner.cpf': cpf });
  return query;
};

const addCredit = async (destination, quantity) => {
  const conn = await connection();
  const options = {
    returnNewDocument: true,
    projection: {
      _id: 0,
    },
  };
  const query = await conn.collection('users').findOneAndUpdate({ 'account_owner.cpf': destination }, {
    $inc: { credit: +quantity },
  }, options);
  return query.value;
};

const removeCredit = async (destination, quantity) => {
  const conn = await connection();
  const options = {
    returnNewDocument: true,
    projection: {
      _id: 0,
    },
  };
  const query = await conn.collection('users').findOneAndUpdate({ 'account_owner.cpf': destination }, {
    $inc: { credit: -quantity },
  }, options);
  return query.value;
};

module.exports = {
  create,
  findByCpf,
  addCredit,
  removeCredit,
};
