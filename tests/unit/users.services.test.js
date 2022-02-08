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
const userServices = require('../../services/userServices');
const userModels = require('../../models/models');
const CustomError = require('../../utils/CustomError');
const statusCode = require('../../utils/statusCode.json');
const testValues = require('./utils/testValues');

use(require('sinon-chai'));
use(require('chai-as-promised'));

describe('SERVICES', async () => {
  describe('create()', async () => {
    describe('if the body is wrong', async () => {
      let spyCreate;
      before(() => {
        spyCreate = sinon.spy(userModels, 'create');
      });
      after(() => {
        spyCreate.restore();
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
      });
    });
    describe('if the user is already registered', async () => {
      let spyCreate;
      before(() => {
        spyCreate = sinon.spy(userModels, 'create');
        sinon.stub(userModels, 'findByCpf').resolves(true);
      });
      after(() => {
        userModels.findByCpf.restore();
        spyCreate.restore();
      });
      it('should not call userModels.create()', async () => {
        await expect(userServices.create({}))
          .to.be.rejected
          .then(() => {
            expect(spyCreate).to.have.not.been.called;
          });
      });
      it('should be rejected with the right CustomError', async () => {
        await expect(userServices.create({
          cpf: `${testValues.VALID_CPF}`,
          name: testValues.VALID_NAME,
          password: testValues.VALID_PASSWORD,
        }))
          .to.eventually.rejectedWith('User already registered')
          .and.be.an.instanceOf(CustomError)
          .and.have.property('status', statusCode.ALREADY_REGISTERED);
      });
    });
    describe('if the body is right', async () => {
      before(() => {
        sinon.stub(bcrypt, 'hash').resolves(true);
        sinon.stub(userModels, 'create').resolves(true);
        sinon.stub(userModels, 'findByCpf').resolves(false);
      });
      after(() => {
        userModels.create.restore();
        userModels.findByCpf.restore();
        bcrypt.hash.restore();
      });
      it('should call userModels.create()', async () => {
        await userServices.create({
          cpf: `${testValues.VALID_CPF}`,
          name: testValues.VALID_NAME,
          password: testValues.VALID_PASSWORD,
        });
        expect(userModels.create).to.have.been.called;
      });
    });
  });
  describe('login()', async () => {
    describe('if the body is wrong', async () => {
      it('should be a promise', async () => {
        expect(userServices.login({})).to.be.a('promise');
      });
      it('should be rejected with an CustomError', async () => {
        await expect(userServices.login({}))
          .to.eventually.be.rejected
          .and.be.an.instanceOf(CustomError);
      });
    });
    describe('if the CPF does not exists', async () => {
      before(() => {
        sinon.stub(userModels, 'findByCpf').resolves(null);
      });
      after(() => {
        userModels.findByCpf.restore();
      });
      it('should be a promise', async () => {
        expect(userServices.login({
          cpf: `${testValues.VALID_CPF}`,
          password: `${testValues.VALID_PASSWORD}`,
        }))
          .to.be.a('promise');
      });
      it('should be rejected with the right CustomError', async () => {
        await expect(userServices.login({
          cpf: `${testValues.VALID_CPF}`,
          password: `${testValues.VALID_PASSWORD}`,
        }))
          .to.eventually.be.rejectedWith('User not found.')
          .and.be.an.instanceOf(CustomError)
          .and.have.property('status', statusCode.NOT_FOUND);
      });
    });
    describe('if the password is wrong', async () => {
      before(() => {
        sinon.stub(userModels, 'findByCpf').resolves({ account_owner: { password: '' } });
        sinon.stub(bcrypt, 'compare').resolves(false);
      });
      after(() => {
        bcrypt.compare.restore();
        userModels.findByCpf.restore();
      });
      it('should be a promise', async () => {
        expect(userServices.login({
          cpf: `${testValues.VALID_CPF}`,
          password: `${testValues.VALID_PASSWORD}`,
        })).to.be.a('promise');
      });
      it('should be rejected with the right CustomError', async () => {
        await expect(userServices.login({
          cpf: `${testValues.VALID_CPF}`,
          password: `${testValues.VALID_PASSWORD}`,
        }))
          .to.eventually.be.rejectedWith('Wrong password.')
          .and.be.an.instanceOf(CustomError)
          .and.have.property('status', statusCode.UNAUTHORIZED);
      });
    });
    describe('if the all credentials are right', async () => {
      before(() => {
        sinon.stub(userModels, 'findByCpf').resolves({ account_owner: { password: '' } });
        sinon.stub(bcrypt, 'compare').resolves(true);
        sinon.stub(jwt, 'sign').returns(testValues.EXAMPLE_TOKEN);
      });
      after(() => {
        userModels.findByCpf.restore();
        bcrypt.compare.restore();
      });
      it('should be a promise', async () => {
        expect(userServices.login({
          cpf: `${testValues.VALID_CPF}`,
          password: `${testValues.VALID_PASSWORD}`,
        })).to.be.a('promise');
      });
      it('should be resolved with a valid jwt token', async () => {
        const result = await userServices.login({
          cpf: `${testValues.VALID_CPF}`,
          password: `${testValues.VALID_PASSWORD}`,
        });
        const isAToken = jwt.verify(result, testValues.SECRET_KEY, (err) => {
          if (err) return false;
          return true;
        });
        expect(isAToken).to.be.equal(true);
      });
    });
  });
  describe('transfer()', async () => {
    describe('when the body is bad', async () => {
      describe('if there`s invalid data', async () => {
        it('should be rejected with a custom error', async () => {
          await expect(userServices.transfer({}))
            .to.eventually.be.rejected
            .and.be.an.instanceOf(CustomError);
        });
      });
      describe('if the user doesnt have enought credit', async () => {
        before(() => {
          sinon.stub(userModels, 'findByCpf').resolves({
            credit: 0,
          });
        });

        after(() => {
          userModels.findByCpf.restore();
        });
        it('should be rejected with a CustomError', async () => {
          await expect(userServices.transfer({ cpf: testValues.VALID_CPF, quantity: 1500 }, ''))
            .to.eventually.be.rejected
            .and.be.an.instanceOf(CustomError);
        });
      });
      describe('if the destination doesn`t exist', async () => {
        before(() => {
          sinon.stub(userModels, 'findByCpf').resolves({
            credit: 500,
          });
          sinon.stub(userModels, 'addCredit').resolves(null);
        });

        after(() => {
          userModels.findByCpf.restore();
          userModels.addCredit.restore();
        });
        it('should be rejected with a CustomError', async () => {
          await expect(userServices.transfer({
            cpf: `${testValues.VALID_CPF}`, quantity: 300,
          }, 'test'))
            .to.eventually.be.rejected
            .and.be.an.instanceOf(CustomError)
            .then(() => {
              expect(userModels.addCredit).to.have.been.called;
            });
        });
      });
    });
    describe('if data is ok', async () => {
      before(() => {
        sinon.stub(userModels, 'addCredit').resolves({ insertedId: true });
        sinon.stub(userModels, 'findByCpf').resolves({
          credit: 500,
        });
        sinon.stub(userModels, 'removeCredit').resolves(true);
      });
      after(() => {
        userModels.addCredit.restore();
        userModels.findByCpf.restore();
        userModels.removeCredit.restore();
      });
      it('should return nothing', async () => {
        await expect(userServices.transfer({ cpf: `${testValues.VALID_CPF}`, quantity: 300 }, 'test'))
          .to.eventually.be.fulfilled;
      });
    });
  });
  describe('deposit()', async () => {
    describe('it should throw a CustomError if', async () => {
      it('the data is invalid', async () => {
        await expect(userServices.deposit({}))
          .to.eventually.be.rejected
          .and.be.an.instanceOf(CustomError);
      });
    });
    describe('when all data is ok', async () => {
      before(() => {
        sinon.stub(userModels, 'addCredit').resolves(true);
      });
      after(() => {
        userModels.addCredit.restore();
      });
      it('should return nothing', async () => {
        await expect(userServices.deposit({ quantity: 300 }, ''))
          .to.eventually.be.fulfilled;
      });
    });
  });
});
