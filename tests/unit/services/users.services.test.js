/* eslint-disable no-unused-expressions */
const sinon = require('sinon');
const {
  describe,
  it,
  before,
  after,
} = require('mocha');
const { expect, use } = require('chai');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userServices = require('../../../services/userServices');
const serviceHelpers = require('../../../services/serviceHelpers');
const userModels = require('../../../models/userModels');
const CustomError = require('../../../utils/CustomError');
const statusCode = require('../../../utils/statusCode.json');
const testValues = require('../utils/testValues');

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
        sinon.stub(serviceHelpers, 'validateRegisterBody').returns(new CustomError());
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
      it('should be rejected with a CustomError', async () => {
        await expect(userServices.create({}))
          .to.eventually.be.rejected
          .and.be.an.instanceOf(CustomError);
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
      it('should be rejected with the right CustomError', async () => {
        await expect(userServices.create({}))
          .to.eventually.rejectedWith('User already registered')
          .and.be.an.instanceOf(CustomError)
          .and.have.property('status', statusCode.ALREADY_REGISTERED);
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
  describe('login()', async () => {
    describe('if the body is wrong', async () => {
      before(() => {
        sinon.stub(serviceHelpers, 'validateLoginBody').returns(new CustomError());
      });
      after(() => {
        serviceHelpers.validateLoginBody.restore();
      });
      it('should be a promise', async () => {
        expect(userServices.login({})).to.be.a('promise');
      });
      it('should be rejected with an CustomError', async () => {
        await expect(userServices.login({}))
          .to.eventually.be.rejected
          .and.be.an.instanceOf(CustomError);
      });
      it('should have called validateLoginBody()', async () => {
        await expect(userServices.login({}))
          .to.eventually.be.rejected
          .then(() => {
            expect(serviceHelpers.validateLoginBody).to.have.been.called;
          });
      });
    });
    describe('if the CPF does not exists', async () => {
      before(() => {
        sinon.stub(serviceHelpers, 'validateLoginBody').returns(true);
        sinon.stub(userModels, 'findByCpf').resolves(null);
      });
      after(() => {
        serviceHelpers.validateLoginBody.restore();
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
        sinon.stub(serviceHelpers, 'validateLoginBody').returns(true);
        sinon.stub(userModels, 'findByCpf').resolves({ account_owner: { password: '' } });
        sinon.stub(bcrypt, 'compare').resolves(false);
      });
      after(() => {
        bcrypt.compare.restore();
        userModels.findByCpf.restore();
        serviceHelpers.validateLoginBody.restore();
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
        sinon.stub(serviceHelpers, 'validateLoginBody').returns(true);
        sinon.stub(userModels, 'findByCpf').resolves({ account_owner: { password: '' } });
        sinon.stub(bcrypt, 'compare').resolves(true);
        sinon.stub(jwt, 'sign').returns(testValues.EXAMPLE_TOKEN);
      });
      after(() => {
        serviceHelpers.validateLoginBody.restore();
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
});
