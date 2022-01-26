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
const userModels = require('../../../models/userModels');
const CustomError = require('../../../utils/CustomError');

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
      before(() => {
        sinon.stub(serviceHelpers, 'validateRegisterBody').returns(new Error('foo'));
      });
      after(() => {
        serviceHelpers.validateRegisterBody.restore();
        userModels.create.restore();
      });
      it('should call validateRegisterBody()', async () => {
        await expect(userServices.create({}))
          .to.eventually.be.rejected
          .then(() => {
            expect(serviceHelpers.validateRegisterBody).to.have.been.calledWith({});
          });
      });
      it('should not call userModels.create()', async () => {
        await expect(userServices.create({}))
          .to.be.rejected
          .then(() => {
            expect(spyCreate).to.have.not.been.called;
          });
      });
      it('should throw an error', async () => {
        await expect(userServices.create({}))
          .to.eventually.throw;
        // should search if this is the best way to do it
      });
    });
    describe('if the user is already registered', async () => {
      before(() => {
        sinon.stub(userModels, 'findByCpf').resolves(true);
        sinon.stub(serviceHelpers, 'validateRegisterBody').returns(true);
      });
      after(() => {
        userModels.findByCpf.restore();
        serviceHelpers.validateRegisterBody.restore();
      });
      it('should call userModes.findByCpf', async () => {
        await expect(userServices.create({}))
          .to.be.rejected
          .then(() => {
            expect(userModels.findByCpf).to.have.been.called;
          });
      });
      it('should not call userModels.create()', async () => {
        await expect(userServices.create({}))
          .to.be.rejected
          .then(() => {
            expect(spyCreate).to.have.not.been.called;
          });
      });
      it('should throw the right error', async () => {
        await expect(userServices.create({}))
          .to.eventually.rejectedWith('User already registered')
          .and.be.an.instanceOf(CustomError)
          .and.have.property('status', 409);
      });
    });
    describe('if the body is right', async () => {
      before(() => {
        sinon.stub(serviceHelpers, 'validateRegisterBody').returns(true);
        sinon.stub(bcrypt, 'hash').resolves(true);
        sinon.stub(userModels, 'create').resolves(true);
        sinon.stub(userModels, 'findByCpf').resolves(false);
      });
      after(() => {
        serviceHelpers.validateRegisterBody.restore();
        userModels.findByCpf.restore();
        bcrypt.hash.restore();
        userModels.create.restore();
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
});
