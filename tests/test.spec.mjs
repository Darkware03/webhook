import { it, describe } from 'mocha';
// eslint-disable-next-line no-unused-vars
import chai, { expect, assert } from 'chai';
import chaiHttp from 'chai-http';
// import url from './config.mjs';

chai.use(chaiHttp);

describe('Array', () => {
  describe('#indexOf()', () => {
    it('should return -1 when the value is not present', () => {
      assert.equal(-1, [1, 2, 3].indexOf(5));
      assert.equal(-1, [1, 2, 3].indexOf(0));
    });
  });
});
