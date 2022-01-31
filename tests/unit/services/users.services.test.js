/* eslint-disable no-unused-expressions */
const sinon = require('sinon');
const {
  describe,
  it,
  before,
  after,
  afterEach,
} = require('mocha');
const { expect, use } = require('chai');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userServices = require('../../../services/userServices');
const userModels = require('../../../models/models');
const CustomError = require('../../../utils/CustomError');
const statusCode = require('../../../utils/statusCode.json');
const testValues = require('../utils/testValues');
const schemas = require('../../../utils/joi-schemas');

use(require('sinon-chai'));
use(require('chai-as-promised'));

describe('SERVICES', async () => {
  describe('create()', async () => {
    let spyCreate;
    before(() => {
      spyCreate = sinon.spy(userModels, 'create');
    });
    after(() => {
      spyCreate.restore();
    });

    describe('if the body is wrong', async () => {
      it('should not call userModels.create()', async () => {
        await expect(userServices.create({}))
          .to.be.rejected
          .then(() => {
            expect(spyCreate).to.have.not.been.called;
          });
      });
      it('should be rejected with a CustomError', async () => {
        await expect(userServices.create({}))
          .to.eventually.be.rejected
          .and.be.an.instanceOf(CustomError);
      });
    });
    describe('if the user is already registered', async () => {
      before(() => {
        sinon.stub(userModels, 'findByCpf').resolves(true);
        sinon.stub(schemas.newUserBody, 'validate').returns(true);
      });
      after(() => {
        schemas.newUserBody.validate.restore();
        userModels.findByCpf.restore();
      });
      it('should not call userModels.create()', async () => {
        await expect(userServices.create({}))
          .to.be.rejected
          .then(() => {
            expect(spyCreate).to.have.not.been.called;
          });
      });
      it('should be rejected with the right CustomError', async () => {
        await expect(userServices.create({}))
          .to.eventually.rejectedWith('User already registered')
          .and.be.an.instanceOf(CustomError)
          .and.have.property('status', statusCode.ALREADY_REGISTERED);
      });
    });
    describe('if the body is right', async () => {
      before(() => {
        sinon.stub(schemas.newUserBody, 'validate').returns(true);
        sinon.stub(bcrypt, 'hash').resolves(true);
        sinon.stub(userModels, 'findByCpf').resolves(false);
      });
      after(() => {
        schemas.newUserBody.validate.restore();
        userModels.findByCpf.restore();
        bcrypt.hash.restore();
      });
      it('should call bcrypt.hash() to encrypt password', async () => {
        await userServices.create({});
        expect(bcrypt.hash).to.have.been.called;
      });
      it('should call userModels.create()', async () => {
        await userServices.create({});
        expect(userModels.create).to.have.been.called;
      });
    });
  });
  describe('login()', async () => {
    describe('if the body is wrong', async () => {
      before(() => {
        sinon.stub(schemas.loginBody, 'validate').returns({ error: { message: 'test' } });
      });
      after(() => {
        schemas.loginBody.validate.restore();
      });
      it('should be a promise', async () => {
        expect(userServices.login({})).to.be.a('promise');
      });
      it('should be rejected with an CustomError', async () => {
        await expect(userServices.login({}))
          .to.eventually.be.rejected
          .and.be.an.instanceOf(CustomError);
      });
      it('should have called schemas.loginBody.validate()', async () => {
        await expect(userServices.login({}))
          .to.eventually.be.rejected
          .then(() => {
            expect(schemas.loginBody.validate).to.have.been.called;
          });
      });
    });
    describe('if the CPF does not exists', async () => {
      before(() => {
        sinon.stub(schemas.loginBody, 'validate').returns(true);
        sinon.stub(userModels, 'findByCpf').resolves(null);
      });
      after(() => {
        schemas.loginBody.validate.restore();
        userModels.findByCpf.restore();
      });
      it('should be a promise', async () => {
        expect(userServices.login({})).to.be.a('promise');
      });
      it('should be rejected with the right CustomError', async () => {
        await expect(userServices.login({}))
          .to.eventually.be.rejectedWith('User not found.')
          .and.be.an.instanceOf(CustomError)
          .and.have.property('status', statusCode.NOT_FOUND);
      });
    });
    describe('if the password is wrong', async () => {
      before(() => {
        sinon.stub(schemas.loginBody, 'validate').returns(true);
        sinon.stub(userModels, 'findByCpf').resolves({ account_owner: { password: '' } });
        sinon.stub(bcrypt, 'compare').resolves(false);
      });
      after(() => {
        bcrypt.compare.restore();
        userModels.findByCpf.restore();
        schemas.loginBody.validate.restore();
      });
      it('should be a promise', async () => {
        expect(userServices.login({})).to.be.a('promise');
      });
      it('should be rejected with the right CustomError', async () => {
        await expect(userServices.login({}))
          .to.eventually.be.rejectedWith('Wrong password.')
          .and.be.an.instanceOf(CustomError)
          .and.have.property('status', statusCode.UNAUTHORIZED);
      });
    });
    describe('if the all credentials are right', async () => {
      before(() => {
        sinon.stub(schemas.loginBody, 'validate').returns(true);
        sinon.stub(userModels, 'findByCpf').resolves({ account_owner: { password: '' } });
        sinon.stub(bcrypt, 'compare').resolves(true);
        sinon.stub(jwt, 'sign').returns(testValues.EXAMPLE_TOKEN);
      });
      after(() => {
        schemas.loginBody.validate.restore();
        userModels.findByCpf.restore();
        bcrypt.compare.restore();
      });
      it('should be a promise', async () => {
        expect(userServices.login({})).to.be.a('promise');
      });
      it('should be resolved with a valid jwt token', async () => {
        const result = await userServices.login({});
        const isAToken = jwt.verify(result, testValues.SECRET_KEY, (err) => {
          if (err) return false;
          return true;
        });
        expect(isAToken).to.be.equal(true);
      });
    });
  });
  describe('transfer()', async () => {
    describe('it should throw an CustomError if', async () => {
      before(() => {
        sinon.stub(userModels, 'addCredit').resolves({ insertedId: null });
      });

      after(() => {
        userModels.addCredit.restore();
      });
      afterEach(() => {
        schemas.depositBody.validate.restore();
      });
      it('there`s invalid data', async () => {
        sinon.stub(schemas.depositBody, 'validate').returns({ error: { message: '' } });

        await expect(userServices.transfer({}))
          .to.eventually.be.rejected
          .and.be.an.instanceOf(CustomError);
      });
      it('the user doesnt have enough credit', async () => {
        sinon.stub(schemas.depositBody, 'validate').returns(true);
        sinon.stub(userModels, 'findByCpf').resolves({
          credit: 0,
        });

        await expect(userServices.transfer({ body: { cpf: testValues.VALID_CPF, quantity: 300 } }))
          .to.eventually.be.rejected
          .and.be.an.instanceOf(CustomError);

        userModels.findByCpf.restore();
      });
      it('the destination doesn`t exist', async () => {
        sinon.stub(schemas.depositBody, 'validate').returns(true);
        sinon.stub(userModels, 'findByCpf').resolves({
          credit: 500,
        });

        await expect(userServices.transfer({ body: { cpf: testValues.VALID_CPF, quantity: 300 } }))
          .to.eventually.be.rejected
          .and.be.an.instanceOf(CustomError)
          .then(() => {
            expect(userModels.addCredit).to.have.been.called;
          });

        userModels.findByCpf.restore();
      });
    });
    describe('if data is ok', async () => {
      before(() => {
        sinon.stub(userModels, 'addCredit').resolves({ insertedId: true });
        sinon.stub(schemas.depositBody, 'validate').returns(true);
        sinon.stub(userModels, 'findByCpf').resolves({
          credit: 500,
        });
      });
      after(() => {
        userModels.addCredit.restore();
        schemas.depositBody.validate.restore();
        userModels.findByCpf.restore();
      });
      it('should return nothing', async () => {
        await expect(userServices.transfer({ body: { cpf: testValues.VALID_CPF, quantity: 300 } }))
          .to.eventually.be.fulfilled;
      });
    });
  });
});
