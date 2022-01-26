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

describe('HELPERS', () => {
  describe('validateRegisterBody()', () => {
    it('should return an CustomError if there`s missing data', () => {
      let result = serviceHelpers.validateRegisterBody(
        { cpf: undefined, name: VALID_NAME, password: VALID_PASSWORD },
      );
      expect(result).to.be.an.instanceOf(CustomError);
      expect(result).to.have.property('status', statusCode.BAD_REQUEST);
      expect(result).to.have.property('message', 'All fields are required.');

      result = serviceHelpers.validateRegisterBody(
        { cpf: VALID_CPF, name: undefined, password: VALID_PASSWORD },
      );
      expect(result).to.be.an.instanceOf(CustomError);
      expect(result).to.have.property('status', statusCode.BAD_REQUEST);
      expect(result).to.have.property('message', 'All fields are required.');

      result = serviceHelpers.validateRegisterBody(
        { cpf: VALID_CPF, name: VALID_NAME, password: undefined },
      );
      expect(result).to.be.an.instanceOf(CustomError);
      expect(result).to.have.property('status', statusCode.BAD_REQUEST);
      expect(result).to.have.property('message', 'All fields are required.');
    });
    it('should return an CustomError if CPF is invalid', () => {
      const result = serviceHelpers.validateRegisterBody(
        { cpf: INVALID_CPF, name: VALID_NAME, password: VALID_PASSWORD },
      );
      expect(result).to.be.an.instanceOf(CustomError);
      expect(result).to.have.property('status', statusCode.BAD_REQUEST);
      expect(result).to.have.property('message', 'Invalid CPF format.');
    });
    it('should return an CustomError if NAME is invalid', () => {
      const result = serviceHelpers.validateRegisterBody(
        { cpf: VALID_CPF, name: INVALID_NAME, password: VALID_PASSWORD },
      );
      expect(result).to.be.an.instanceOf(CustomError);
      expect(result).to.have.property('status', statusCode.BAD_REQUEST);
      expect(result).to.have.property('message', 'Invalid NAME format.');
    });
    it('should return an Custom if the PASSWORD is invalid', () => {
      const result = serviceHelpers.validateRegisterBody(
        { cpf: VALID_CPF, name: VALID_NAME, password: INVALID_PASSWORD },
      );
      expect(result).to.be.an.instanceOf(CustomError);
      expect(result).to.have.property('status', statusCode.BAD_REQUEST);
      expect(result).to.have.property('message', 'Invalid PASSWORD format.');
    });
    it('should return true everything is fine', () => {
      const result = serviceHelpers.validateRegisterBody(
        { cpf: VALID_CPF, name: VALID_NAME, password: VALID_PASSWORD },
      );
      expect(result).to.be.equal(true);
    });
  });
  describe('validateLoginBody', () => {
    it('should return an CustomError if there`s missing data', () => {
      let result = serviceHelpers.validateLoginBody({
        cpf: VALID_CPF,
        password: undefined,
      });

      expect(result).to.be.an.instanceOf(CustomError);
      expect(result).to.have.property('message', 'Missing CPF or PASSWORD.');
      expect(result).to.have.property('status', statusCode.BAD_REQUEST);

      result = serviceHelpers.validateLoginBody({
        cpf: undefined,
        password: VALID_PASSWORD,
      });

      expect(result).to.be.an.instanceOf(CustomError);
      expect(result).to.have.property('message', 'Missing CPF or PASSWORD.');
      expect(result).to.have.property('status', statusCode.BAD_REQUEST);
    });
    it('should throw an CustomError if the password is invalid', () => {
      const result = serviceHelpers.validateLoginBody({
        cpf: VALID_CPF,
        password: INVALID_PASSWORD,
      });

      expect(result).to.be.an.instanceOf(CustomError);
      expect(result).to.have.property('message', 'Invalid PASSWORD format.');
      expect(result).to.have.property('status', statusCode.BAD_REQUEST);
    });
    it('should throw an CustomError if the CPF is invalid', () => {
      const result = serviceHelpers.validateLoginBody({
        cpf: INVALID_CPF,
        password: VALID_PASSWORD,
      });

      expect(result).to.be.an.instanceOf(CustomError);
      expect(result).to.have.property('message', 'Invalid CPF format.');
      expect(result).to.have.property('status', statusCode.BAD_REQUEST);
    });
    it('should return true if everything is fine', () => {
      const result = serviceHelpers.validateLoginBody({
        cpf: VALID_CPF,
        password: VALID_PASSWORD,
      });

      expect(result).to.be.equal(true);
    });
  });
});
