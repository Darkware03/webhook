import { it, describe } from 'mocha';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import url from './config.mjs';

chai.use(chaiHttp);

describe('Inicializando pruebas para /api/v1/usuarios', () => {
  let token;

  beforeEach((done) => {
    // se ejecuta antes de cada prueba en este bloque
    chai.request(url)
      .post('/api/v1/login')
      .send({
        email: 'admin@salud.gob.sv',
        password: 'admin',
      })
      .end((err, res) => {
        // console.log(res.body.token);
        token = res.body.token;

        expect(res).to.have.status(200);
        done();
      });
  });
  /*
  it('Test de get usuarios [get] /api/v1/users, caso de error: sin rol asignado', (done) => {
    chai.request(url)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        // console.log(response.body);
        expect(response).to.have.status(403);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  */
  it('Test de get usuarios [get] /api/v1/users, caso exitoso', (done) => {
    chai.request(url)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        // console.log(response.body);
        expect(response).to.have.status(200);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('Test de update email [put] /api/v1/users/update/email, caso de error: correo a actualizar igual', (done) => {
    chai.request(url)
      .put('/api/v1/users/update/email')
      .send({
        email: 'admin@salud.gob.sv',
        password: 'admin',
      })
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        // console.log(response.body);
        expect(response).to.have.status(422);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('Test de update email [put] /api/v1/users/update/email, caso de error: sin autorizacion', (done) => {
    chai.request(url)
      .put('/api/v1/users/update/email')
      .send({
        email: 'admin1@salud.gob.sv',
        password: 'admin',
      })
      .set('Authorization', 'Bearer')
      .then((response) => {
        // console.log(response.body);
        expect(response).to.have.status(401);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('Test de update email [put] /api/v1/users/update/email, caso de error: parametros incompletos', (done) => {
    chai.request(url)
      .put('/api/v1/users/update/email')
      .send({
        email: 'admin@salud.gob.sv',
      })
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        // console.log(response.body);
        expect(response).to.have.status(400);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('Test de update email [put] /api/v1/users/update/email, caso exitoso', (done) => {
    chai.request(url)
      .put('/api/v1/users/update/email')
      .send({
        email: 'admin1@salud.gob.sv',
        password: 'admin',
      })
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        // console.log(response.body);
        expect(response).to.have.status(200);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
