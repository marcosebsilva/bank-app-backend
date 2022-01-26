/* eslint-disable no-unused-expressions */
const {
  describe,
  it,
} = require('mocha');
const { expect } = require('chai');
const serviceHelpers = require('../../../services/serviceHelpers');
const testValues = require('../utils/testValues.json');
const CustomError = require('../../../utils/CustomError');
const statusCode = require('../../../utils/statusCode.json');

const {
  INVALID_CPF,
  INVALID_NAME,
  VALID_CPF,
  VALID_NAME,
} = testValues;

describe('HELPERS', async () => {
  describe('validateBody()', async () => {
    it('should throw an CustomError if there`s missing data', async () => {
      let result = serviceHelpers.validateBody({ cpf: undefined, name: VALID_NAME });
      expect(result).to.be.an.instanceOf(CustomError);
      expect(result).to.have.property('status', statusCode.BAD_REQUEST);
      expect(result).to.have.property('message', 'Missing CPF or NAME field.');

      result = serviceHelpers.validateBody({ cpf: VALID_CPF, name: undefined });
      expect(result).to.be.an.instanceOf(CustomError);
      expect(result).to.have.property('status', statusCode.BAD_REQUEST);
      expect(result).to.have.property('message', 'Missing CPF or NAME field.');
    });
    it('should throw an CustomError if CPF is invalid', async () => {
      const result = serviceHelpers.validateBody({ cpf: INVALID_CPF, name: VALID_NAME });
      expect(result).to.be.an.instanceOf(CustomError);
      expect(result).to.have.property('status', statusCode.BAD_REQUEST);
      expect(result).to.have.property('message', 'Invalid CPF format.');
    });
    it('should throw an CustomError if NAME is invalid', async () => {
      const result = serviceHelpers.validateBody({ cpf: VALID_CPF, name: INVALID_NAME });
      expect(result).to.be.an.instanceOf(CustomError);
      expect(result).to.have.property('status', statusCode.BAD_REQUEST);
      expect(result).to.have.property('message', 'Invalid NAME format.');
    });
    it('should return nothing everything is fine', async () => {
      const result = await serviceHelpers.validateBody({ cpf: VALID_CPF, name: VALID_NAME });
      expect(result).to.be.equal(true);
    });
  });
});
