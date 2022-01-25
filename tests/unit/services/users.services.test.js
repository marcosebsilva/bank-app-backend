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
  describe('validateBody()', async () => {
    const {
      INVALID_CPF,
      INVALID_NAME,
      VALID_CPF,
      VALID_NAME,
    } = testValues;
    describe('If the body is wrong', async () => {
      before(async () => {
        sinon.stub(userModels, 'create').resolves({
          acknowledged: null,
          insertedId: null,
        });
        sinon.stub(userModels, 'findByCpf').resolves({
          _id: null,
          account_owner: {
            name: null,
            cpf: null,
          },
          credit: null,
        });
      });
      after(() => {
        userModels.create.restore();
        userModels.findByCpf.restore();
      });

      it('should throw an CustomError if there`s missing data', async () => {
        await expect(userServices.validateBody({ cpf: undefined, name: VALID_NAME }))
          .to.eventually.be.rejectedWith('Missing CPF or NAME field.')
          .and.be.an.instanceOf(CustomError)
          .and.have.property('status', statusCode.BAD_REQUEST);
        await expect(userServices.validateBody({ cpf: VALID_CPF, name: undefined }))
          .to.eventually.be.rejectedWith('Missing CPF or NAME field.')
          .and.be.an.instanceOf(CustomError)
          .and.have.property('status', statusCode.BAD_REQUEST);
      });
      it('should throw an CustomError if CPF is invalid', async () => {
        await expect(userServices.validateBody({ cpf: INVALID_CPF, name: VALID_NAME }))
          .to.eventually.be.rejectedWith('Invalid CPF format.')
          .and.be.an.instanceOf(CustomError)
          .and.have.property('status', statusCode.BAD_REQUEST);
      });
      it('should throw an CustomError if CPF is already registered', async () => {
        await expect(userServices.validateBody({ cpf: VALID_CPF, name: VALID_NAME }))
          .to.eventually.be.rejectedWith('User already registered.')
          .and.be.an.instanceOf(CustomError)
          .and.have.property('status', statusCode.ALREADY_REGISTERED)
          .then(() => {
            expect(userModels.findByCpf.calledWith(VALID_CPF)).to.be.equal(true);
          });
      });
      it('should throw an CustomError if NAME is invalid', async () => {
        await expect(userServices.validateBody({ cpf: VALID_CPF, name: INVALID_NAME }))
          .to.eventually.be.rejectedWith('Invalid NAME format.')
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
