/* eslint-disable no-unused-expressions */
const sinon = require('sinon');
const {
  describe,
  it,
  before,
  after,
} = require('mocha');
const { expect, use } = require('chai');
const userServices = require('../../../services/userServices');
const serviceHelpers = require('../../../services/serviceHelpers');
const testValues = require('../utils/testValues.json');
const userModels = require('../../../models/userModels');

use(require('sinon-chai'));
use(require('chai-as-promised'));

describe('SERVICES', async () => {
  const {
    INVALID_NAME,
    VALID_CPF,
    VALID_NAME,
  } = testValues;

  describe('create()', async () => {
    describe('if the user is wrong', async () => {
      const badBody = {
        name: INVALID_NAME,
        cpf: VALID_CPF,
      };
      before(() => {
        sinon.stub(serviceHelpers, 'validateBody').returns(new Error('foo'));
        sinon.stub(userModels, 'create').resolves(true);
      });
      after(() => {
        serviceHelpers.validateBody.restore();
        userModels.create.restore();
      });
      it('should call validateBody()', async () => {
        await expect(userServices.create(badBody))
          .to.eventually.be.rejectedWith('foo')
          .then(() => {
            expect(serviceHelpers.validateBody.calledWith(badBody)).to.be.equal(true);
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
    describe('if the user is right', async () => {
      const goodBody = {
        name: VALID_NAME,
        cpf: VALID_CPF,
      };
      before(() => {
        sinon.stub(userModels, 'create').resolves(true);
        sinon.stub(serviceHelpers, 'validateBody').returns(true);
      });
      after(() => {
        userModels.create.restore();
        serviceHelpers.validateBody.restore();
      });
      it('should call userModels.create()', async () => {
        await expect(userServices.create(goodBody));
        expect(userModels.create).to.have.been.called;
      });
    });
  });
});
