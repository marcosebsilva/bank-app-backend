/* eslint-disable no-unused-expressions */
const {
  describe,
  it,
} = require('mocha');
const { expect } = require('chai');
const serviceHelpers = require('../../../services/serviceHelpers');
const testValues = require('../utils/testValues');
const CustomError = require('../../../utils/CustomError');
const statusCode = require('../../../utils/statusCode.json');

const {
  INVALID_CPF,
  INVALID_NAME,
  VALID_CPF,
  VALID_NAME,
  VALID_PASSWORD,
  INVALID_PASSWORD,
} = testValues;

describe('HELPERS', async () => {
  describe('validateBody()', async () => {
    it('should return an CustomError if there`s missing data', async () => {
      let result = serviceHelpers.validateBody(
        { cpf: undefined, name: VALID_NAME, password: VALID_PASSWORD },
      );
      expect(result).to.be.an.instanceOf(CustomError);
      expect(result).to.have.property('status', statusCode.BAD_REQUEST);
      expect(result).to.have.property('message', 'All fields are required.');

      result = serviceHelpers.validateBody(
        { cpf: VALID_CPF, name: undefined, password: VALID_PASSWORD },
      );
      expect(result).to.be.an.instanceOf(CustomError);
      expect(result).to.have.property('status', statusCode.BAD_REQUEST);
      expect(result).to.have.property('message', 'All fields are required.');

      result = serviceHelpers.validateBody(
        { cpf: VALID_CPF, name: VALID_NAME, password: undefined },
      );
      expect(result).to.be.an.instanceOf(CustomError);
      expect(result).to.have.property('status', statusCode.BAD_REQUEST);
      expect(result).to.have.property('message', 'All fields are required.');
    });
    it('should return an CustomError if CPF is invalid', async () => {
      const result = serviceHelpers.validateBody(
        { cpf: INVALID_CPF, name: VALID_NAME, password: VALID_PASSWORD },
      );
      expect(result).to.be.an.instanceOf(CustomError);
      expect(result).to.have.property('status', statusCode.BAD_REQUEST);
      expect(result).to.have.property('message', 'Invalid CPF format.');
    });
    it('should return an CustomError if NAME is invalid', async () => {
      const result = serviceHelpers.validateBody(
        { cpf: VALID_CPF, name: INVALID_NAME, password: VALID_PASSWORD },
      );
      expect(result).to.be.an.instanceOf(CustomError);
      expect(result).to.have.property('status', statusCode.BAD_REQUEST);
      expect(result).to.have.property('message', 'Invalid NAME format.');
    });
    it('should return an Custom if the PASSWORD is invalid', async () => {
      const result = serviceHelpers.validateBody(
        { cpf: VALID_CPF, name: VALID_NAME, password: INVALID_PASSWORD },
      );
      expect(result).to.be.an.instanceOf(CustomError);
      expect(result).to.have.property('status', statusCode.BAD_REQUEST);
      expect(result).to.have.property('message', 'Invalid PASSWORD format.');
    });
    it('should return nothing everything is fine', async () => {
      const result = await serviceHelpers.validateBody(
        { cpf: VALID_CPF, name: VALID_NAME, password: VALID_PASSWORD },
      );
      expect(result).to.be.equal(true);
    });
  });
});
