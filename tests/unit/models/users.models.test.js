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
const testValues = require('../utils/testValues.json');

let memoryServer;
let mockConnection;
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
  const { VALID_CPF, VALID_NAME } = testValues;
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

describe('FIND BY CPF', async () => {
  const { VALID_NAME, VALID_CPF } = testValues;
  describe('if the user exists', async () => {
    before(async () => {
      const conn = await connection();
      await conn.collection('users').insertOne({
        account_owner: {
          cpf: VALID_CPF,
          name: VALID_NAME,
        },
        credit: 0,
      });
    });
    after(async () => {
      const conn = await connection();
      await conn.collection('users').drop();
    });
    it('should return the right user', async () => {
      const result = await usersModels.findByCpf(VALID_CPF);
      expect(result).to.be.a('object')
        .that.has.all.keys('_id', 'account_owner', 'credit');
      expect(result).to.have.nested.property('account_owner.name');
      expect(result).to.have.nested.property('account_owner.cpf');
      expect(result.account_owner.cpf).to.be.equal(VALID_CPF);
    });
  });
  describe('if the user does not exists', async () => {
    it('should return nothing', async () => {
      const result = await usersModels.findByCpf(VALID_CPF);
      expect(result).to.not.be.a('object');
      expect(result).to.be.a('null');
    });
  });
});
