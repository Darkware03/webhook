import request from 'supertest';
import Server from '../configs/server.mjs';

const host = `${Server.host}:${Server.port}`;

let token;

beforeAll((done) => {
  request(host)
    .post('/api/v1/login')
    .send({
      email: 'admin@salud.gob.sv',
      password: 'admin',
    }).end((err, response) => {
      token = response.body.token;
      done();
    });
});

describe('test de creacion de usuarios', () => {
  test('name test', (done) => {
    request(host)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
