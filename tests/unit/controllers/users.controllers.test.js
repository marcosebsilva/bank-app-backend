const sinon = require('sinon');
const {
  describe,
  it,
  before,
  after,
} = require('mocha');
const { expect, use } = require('chai');
const CustomError = require('../../../utils/CustomError');
const userServices = require('../../../services/userServices');
const userControllers = require('../../../controllers/userController');
const statusCode = require('../../../utils/statusCode.json');

use(require('sinon-chai'));

const request = {};
const response = {};
const next = sinon.spy();

before(() => {
  response.status = sinon.stub().returns(response);
  response.sendStatus = sinon.stub().returns(response);
  response.json = sinon.stub().returns();
});
describe('CONTROLLERS', async () => {
  describe('create()', async () => {
    describe('When the request is bad', async () => {
      const genericError = new CustomError('TEST ERROR', 111);
      before(() => {
        request.body = {};
        sinon.stub(userServices, 'create').throws(genericError);
      });
      after(() => {
        userServices.create.restore();
      });
      it('should call error middleware', async () => {
        await userControllers.create(request, response, next);
        expect(next.calledWith(genericError)).to.be.equal(true);
      });
    });
    describe('if the body is right', () => {
      before(() => {
        sinon.stub(userServices, 'create').resolves({});
      });
      after(() => {
        userServices.create.restore();
      });
      it('should return status 201', async () => {
        await userControllers.create(request, response, next);
        expect(response.sendStatus.calledWith(statusCode.CREATED)).to.be.equal(true);
      });
    });
  });
});
