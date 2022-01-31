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
const testValues = require('../utils/testValues');

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
    describe('When the request is right', () => {
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
  describe('login()', async () => {
    describe('When the request is malformed', async () => {
      before(() => {
        sinon.stub(userServices, 'login').rejects();
      });
      after(() => {
        userServices.login.restore();
      });
      it('should call error middleware', async () => {
        await userControllers.login(request, response, next);
        expect(next).to.have.been.called;
      });
    });
    describe('When the request is right', async () => {
      before(() => {
        sinon.stub(userServices, 'login').resolves(testValues.EXAMPLE_TOKEN);
      });
      after(() => {
        userServices.login.restore();
      });
      it('should return status 200', async () => {
        await userControllers.login(request, response, next);
        expect(response.status).to.have.been.calledWith(statusCode.OK);
      });
      it('should return a jwt token', async () => {
        await userControllers.login(request, response, next);
        expect(response.json).to.have.been.calledWith({ token: testValues.EXAMPLE_TOKEN });
      });
    });
  });
  describe.only('transfer()', async () => {
    describe('When the request is malformed', async () => {
      before(() => {
        sinon.stub(userServices, 'transfer').rejects();
      });
      after(() => {
        userServices.transfer.restore();
      });
      it('should call error middleware', async () => {
        await userControllers.transfer(request, response, next);
        expect(next).to.have.been.called;
      });
    });
    describe('When the request is right', () => {
      before(() => {
        sinon.stub(userServices, 'transfer').resolves({});
      });
      after(() => {
        userServices.transfer.restore();
      });
      it('should return status 201', async () => {
        await userControllers.transfer(request, response, next);
        expect(response.sendStatus).to.have.been.calledWith(statusCode.OK);
      });
    });
  });
});
