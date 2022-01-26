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
const testValues = require('../utils/testValues.json');
const userModels = require('../../../models/userModels');
const CustomError = require('../../../utils/CustomError');
const statusCode = require('../../../utils/statusCode.json');

use(require('chai-as-promised'));
use(require('sinon-chai'));

describe('SERVICES', async () => {
  const {
    INVALID_CPF,
    INVALID_NAME,
    VALID_CPF,
    VALID_NAME,
  } = testValues;
  describe('validateBody()', async () => {
    describe('If the body is wrong', async () => {
      it('should throw an CustomError if there`s missing data', async () => {
        expect(() => userServices.validateBody({ cpf: undefined, name: VALID_NAME }))
          .to.throw('Missing CPF or NAME field.')
          .and.be.an.instanceOf(CustomError)
          .and.have.property('status', statusCode.BAD_REQUEST);
        expect(() => userServices.validateBody({ cpf: VALID_CPF, name: undefined }))
          .to.throw('Missing CPF or NAME field.')
          .and.be.an.instanceOf(CustomError)
          .and.have.property('status', statusCode.BAD_REQUEST);
      });
      it('should throw an CustomError if CPF is invalid', async () => {
        expect(() => userServices.validateBody({ cpf: INVALID_CPF, name: VALID_NAME }))
          .to.throw('Invalid CPF format.')
          .and.be.an.instanceOf(CustomError)
          .and.have.property('status', statusCode.BAD_REQUEST);
      });
      it('should throw an CustomError if NAME is invalid', async () => {
        expect(() => userServices.validateBody({ cpf: VALID_CPF, name: INVALID_NAME }))
          .to.throw('Invalid NAME format.')
          .and.be.an.instanceOf(CustomError)
          .and.have.property('status', statusCode.BAD_REQUEST);
      });
    });
    describe('If the body is right', async () => {
      before(async () => {
        sinon.stub(userModels, 'findByCpf').resolves(null);
      });
      after(async () => {
        userModels.findByCpf.restore();
      });
      it('should return nothing', async () => {
        const result = await userServices.validateBody({ cpf: VALID_CPF, name: VALID_NAME });
        // eslint-disable-next-line no-unused-expressions
        expect(result).to.be.undefined;
      });
    });
  });
});
