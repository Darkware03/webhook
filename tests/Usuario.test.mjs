import request from 'supertest';
import Server from '../configs/server.mjs';

const host = `${Server.host}:${Server.port}`;

// eslint-disable-next-line no-undef
describe('test de creacion de usuarios', () => {
  // eslint-disable-next-line no-undef
  test('name test', (done) => {
    request(host)
      .get('/api/users')
      .then((response) => {
        // eslint-disable-next-line no-undef
        expect(response.statusCode).toBe(200);
        done();
      }).catch((err) => {
        done(err);
      });
  });
});
