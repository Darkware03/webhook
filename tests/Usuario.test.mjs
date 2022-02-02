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

describe('test de update email', () => {
  test('put updateEmail Usuario', (done) => {
    request(host)
      .put('/api/v1/users/update/mail')
      .send({
        email: 'first_test@mail.com',
      })
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

describe('test de get usarios', () => {
  test('get Index Usuario', (done) => {
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

describe('test de post de usario a la hora de crearlos', () => {
  test('post Store Usuarios', (done) => {
    request(host)
      .post('/api/v1/users')
      .send({
        email: 'first_test@mail.com',
        password: 'admin',
        roles: [1],
      })
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.statusCode).toBe(201);
        done();
      })
      .catch((err) => {
        done(err);
      });

    request(host)
      .post('/api/v1/users')
      .send({
        email: 'first_test@mail.com',
      })
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.statusCode).toBe(400);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
