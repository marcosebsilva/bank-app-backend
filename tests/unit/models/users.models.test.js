const sinon = require('sinon');
const {
  describe,
  it,
  before,
  after,
} = require('mocha');
const { expect } = require('chai');

const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const connection = require('../../../models/connection');
const usersModels = require('../../../models/userModels');

let memoryServer;
let mockConnection;
const TEST_VALUES = {
  VALID_CPF: 15502774651,
  INVALID_CPF: 33345,
  VALID_NAME: 'Joaquin Arruda Campos',
  INVALID_NAME: 'tes',
};
before(async () => {
  memoryServer = await MongoMemoryServer.create();
  const URLMock = await memoryServer.getUri();
  mockConnection = MongoClient.connect(URLMock, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  sinon.stub(MongoClient, 'connect').resolves(mockConnection);
});
after(async () => {
  await memoryServer.stop();
  MongoClient.connect.restore();
});

describe('CREATE', async () => {
  after(async () => {
    const conn = await connection();
    await conn.collection('users').drop();
  });
  const { VALID_CPF, VALID_NAME } = TEST_VALUES;
  it('returns the expected object', async () => {
    const result = await usersModels.create(VALID_NAME, VALID_CPF);
    expect(result).to.be.a('object');
    expect(result).to.have.all.keys('acknowledged', 'insertedId');
  });
  it('creates the user in the DB', async () => {
    const conn = await connection();
    const query = await conn.collection('users').findOne({ 'account_owner.cpf': VALID_CPF });
    expect(query).to.be.a('object')
      .that.has.all.keys('_id', 'account_owner', 'credit');
    expect(query).to.have.nested.property('account_owner.name');
    expect(query).to.have.nested.property('account_owner.cpf');
    expect(query.account_owner.cpf).to.be.equal(VALID_CPF);
  });
});
