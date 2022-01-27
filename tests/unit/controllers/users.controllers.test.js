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

afterEach(() => {
  request.body = {};
});

describe('CONTROLLERS', async () => {
  describe('create()', async () => {
    describe('When the request is malformed', async () => {
      before(() => {
        request.body = {};
        sinon.stub(userServices, 'create').rejects();
      });
      after(() => {
        userServices.create.restore();
      });
      it('should call error middleware', async () => {
        await userControllers.create(request, response, next);
        expect(next).to.have.been.called;
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
        expect(response.sendStatus).to.have.been.calledWith(statusCode.CREATED);
      });
    });
  });
});
