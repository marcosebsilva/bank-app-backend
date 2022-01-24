const connection = require('./connection');

const create = async (name, cpf) => {
  const conn = await connection();
  const query = await conn.collection('users').insertOne({
    account_owner: {
      name,
      cpf,
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

module.exports = {
  create,
  findByCpf,
};
