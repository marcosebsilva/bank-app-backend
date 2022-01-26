/* eslint-disable no-unused-expressions */
const sinon = require('sinon');
const {
  describe,
  it,
  before,
  after,
} = require('mocha');
const { expect, use } = require('chai');
const bcrypt = require('bcrypt');
const userServices = require('../../../services/userServices');
const serviceHelpers = require('../../../services/serviceHelpers');
const testValues = require('../utils/testValues');
const userModels = require('../../../models/userModels');
const CustomError = require('../../../utils/CustomError');

use(require('sinon-chai'));
use(require('chai-as-promised'));

describe('SERVICES', async () => {
  const {
    INVALID_NAME,
    VALID_CPF,
    VALID_NAME,
    VALID_PASSWORD,
    INVALID_CPF,
  } = testValues;

  describe('create()', async () => {
    describe('if the body is wrong', async () => {
      const badBody = {
        name: INVALID_NAME,
        cpf: VALID_CPF,
        password: VALID_PASSWORD,
      };
      before(() => {
        sinon.stub(serviceHelpers, 'validateRegisterBody').returns(new Error('foo'));
        sinon.stub(userModels, 'create').resolves(true);
        sinon.stub(userModels, 'findByCpf').resolves(false);
      });
      after(() => {
        serviceHelpers.validateRegisterBody.restore();
        userModels.create.restore();
        userModels.findByCpf.restore();
      });
      it('should call validateRegisterBody()', async () => {
        await expect(userServices.create(badBody))
          .to.eventually.be.rejectedWith('foo')
          .then(() => {
            expect(serviceHelpers.validateRegisterBody).to.have.been.calledWith(badBody);
          });
      });
      it('should not call userModels.create()', async () => {
        await expect(userServices.create(badBody))
          .to.be.rejectedWith('foo')
          .then(() => {
            expect(userModels.create).to.have.not.been.called;
          });
      });
      it('should throw an error', async () => {
        await expect(userServices.create(badBody))
          .to.eventually.throw;
        // should search if this is the best way to do it
      });
    });
    describe('if the user is already registered', async () => {
      const badBody = {
        name: INVALID_NAME,
        cpf: VALID_CPF,
        password: VALID_PASSWORD,
      };
      before(() => {
        sinon.stub(userModels, 'findByCpf').resolves(true);
        sinon.stub(serviceHelpers, 'validateRegisterBody').returns(true);
        sinon.stub(userModels, 'create').resolves(true);
      });
      after(() => {
        userModels.findByCpf.restore();
        serviceHelpers.validateRegisterBody.restore();
        userModels.create.restore();
      });
      it('should not call userModels.create()', async () => {
        await expect(userServices.create(badBody))
          .to.be.rejectedWith('User already registered.')
          .then(() => {
            expect(userModels.create).to.have.not.been.called;
          });
      });
      it('should throw an error', async () => {
        await expect(userServices.create(badBody))
          .to.eventually.rejectedWith('User already registered')
          .and.be.an.instanceOf(CustomError)
          .and.have.property('status', 409);
      });
    });
    describe('if the body is right', async () => {
      const goodBody = {
        name: VALID_NAME,
        cpf: VALID_CPF,
        password: VALID_PASSWORD,
      };
      const spyBcrypt = sinon.spy(bcrypt, 'hash');
      before(() => {
        sinon.stub(userModels, 'create').resolves(true);
        sinon.stub(serviceHelpers, 'validateRegisterBody').returns(true);
        sinon.stub(userModels, 'findByCpf').resolves(false);
      });
      after(() => {
        userModels.create.restore();
        serviceHelpers.validateRegisterBody.restore();
        bcrypt.hash.restore();
      });
      it('should call bcrypt.hash() to encrypt password', async () => {
        await userServices.create(goodBody);
        expect(spyBcrypt).to.have.been.called;
      });
      it('should call userModels.create()', async () => {
        await userServices.create(goodBody);
        expect(userModels.create).to.have.been.called;
      });
    });
  });
});
