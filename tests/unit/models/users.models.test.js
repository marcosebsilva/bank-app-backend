const sinon = require('sinon');
const {
  describe,
  it,
  before,
  after,
  beforeEach,
  afterEach,
} = require('mocha');
const { expect } = require('chai');

const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcrypt');
const usersModels = require('../../../models/models');
const testValues = require('../utils/testValues');

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
describe('MODELS', async () => {
  describe('create()', async () => {
    after(async () => {
      const conn = await mockConnection;
      await conn.db('awsome_bank').collection('users').drop();
    });
    it('returns the expected object', async () => {
      const result = await usersModels
        .create(testValues.VALID_NAME, testValues.VALID_CPF, await testValues.HASHED_PASSWORD);
      expect(result).to.be.a('object');
      expect(result).to.have.all.keys('acknowledged', 'insertedId');
    });
    it('creates the user in the DB', async () => {
      const conn = await mockConnection;
      const query = await conn.db('awsome_bank').collection('users').findOne({ 'account_owner.cpf': testValues.VALID_CPF });
      expect(query).to.be.a('object')
        .that.has.all.keys('_id', 'account_owner', 'credit');
      expect(query).to.have.nested.property('account_owner.name');
      expect(query).to.have.nested.property('account_owner.password');
      expect(query).to.have.nested.property('account_owner.cpf');
      expect(query.account_owner.cpf).to.be.equal(testValues.VALID_CPF);
      const isHashValid = await bcrypt
        .compare(testValues.VALID_PASSWORD, query.account_owner.password);
      expect(isHashValid).to.be.equal(true);
    });
  });

  describe('findByCpf()', async () => {
    describe('if the user exists', async () => {
      before(async () => {
        const conn = await mockConnection;
        await conn.db('awsome_bank').collection('users').insertOne({
          account_owner: {
            cpf: testValues.VALID_CPF,
            name: testValues.VALID_NAME,
            password: await testValues.HASHED_PASSWORD,
          },
          credit: 0,
        });
      });
      after(async () => {
        const conn = await mockConnection;
        await conn.db('awsome_bank').collection('users').drop();
      });
      it('should return the right user', async () => {
        const result = await usersModels.findByCpf(testValues.VALID_CPF);
        expect(result).to.be.a('object')
          .that.has.all.keys('_id', 'account_owner', 'credit');
        expect(result).to.have.nested.property('account_owner.name');
        expect(result).to.have.nested.property('account_owner.cpf');
        expect(result).to.have.nested.property('account_owner.password');
        expect(result.account_owner.cpf).to.be.equal(testValues.VALID_CPF);
        const isHashValid = await bcrypt
          .compare(testValues.VALID_PASSWORD, result.account_owner.password);
        expect(isHashValid).to.be.equal(true);
      });
    });
    describe('if the user does not exists', async () => {
      it('should return nothing', async () => {
        const result = await usersModels.findByCpf(testValues.VALID_CPF);
        expect(result).to.not.be.a('object');
        expect(result).to.be.a('null');
      });
    });
  });

  describe('addCredit()', async () => {
    beforeEach(async () => {
      const conn = await mockConnection;
      await conn.db('awsome_bank').collection('users').insertOne({
        account_owner: {
          cpf: testValues.VALID_CPF,
          name: testValues.VALID_NAME,
          password: await testValues.HASHED_PASSWORD,
        },
        credit: 0,
      });
    });
    afterEach(async () => {
      const conn = await mockConnection;
      await conn.db('awsome_bank').collection('users').drop();
    });
    it('should return a object with the new value', async () => {
      const result = await usersModels.addCredit(testValues.VALID_CPF, 100);
      expect(result).to.be.a('object');
      expect(result).to.have.nested.property('account_owner.name');
      expect(result).to.have.nested.property('account_owner.password');
      expect(result).to.have.nested.property('account_owner.cpf');
    });
    it('should add the desired credit to the user', async () => {
      await usersModels.addCredit(testValues.VALID_CPF, 100);
      const conn = await mockConnection;
      const query = await conn.db('awsome_bank').collection('users').findOne({ 'account_owner.cpf': testValues.VALID_CPF });
      expect(query).to.have.property('credit', 100);
    });
  });

  describe('removeCredit()', async () => {
    beforeEach(async () => {
      const conn = await mockConnection;
      await conn.db('awsome_bank').collection('users').insertOne({
        account_owner: {
          cpf: testValues.VALID_CPF,
          name: testValues.VALID_NAME,
          password: await testValues.HASHED_PASSWORD,
        },
        credit: 500,
      });
    });
    afterEach(async () => {
      const conn = await mockConnection;
      await conn.db('awsome_bank').collection('users').drop();
    });
    it('should return a object with the new value', async () => {
      const result = await usersModels.removeCredit(testValues.VALID_CPF, 500);
      expect(result).to.be.a('object');
      expect(result).to.have.nested.property('account_owner.name');
      expect(result).to.have.nested.property('account_owner.password');
      expect(result).to.have.nested.property('account_owner.cpf');
    });
    it('should remove credit from the desired user', async () => {
      await usersModels.removeCredit(testValues.VALID_CPF, 500);
      const conn = await mockConnection;
      const query = await conn.db('awsome_bank').collection('users').findOne({ 'account_owner.cpf': testValues.VALID_CPF });
      expect(query).to.have.property('credit', 0);
    });
  });
});
