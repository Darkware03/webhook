import { it, describe } from 'mocha';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import url from './config.mjs';

chai.use(chaiHttp);

describe('Inicializando pruebas para /api/v1/usuarios', () => {
  let token;
  describe('Test de usuarios', () => {
    beforeEach((done) => {
      // se ejecuta antes de cada prueba en este bloque
      chai.request(url)
        .post('/api/v1/login')
        .send({
          email: 'admin@salud.gob.sv',
          password: 'admin',
        })
        .end((err, res) => {
          token = res.body.token;
          // console.log(token);
          expect(res).to.have.status(200);
          done();
        });
    });

    it('Test de get usuarios [get] /api/v1/users, caso exitoso', (done) => {
      chai.request(url)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .then((response) => {
          expect(response).to.have.status(200);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('Test [post] /api/v1/users, envio de datos como form, solo se admiten en formato JSON', (done) => {
      chai.request(url)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .type('form')
        .send({
          email: 'admin2@salud.gob.sv',
          password: 'admin',
        })
        .end((err, res) => {
          // console.log(res.body);
          expect(res).to.have.status(400);
          done();
        });
    });

    it('Test de post [post] /api/v1/users, caso exitoso', (done) => {
      chai.request(url)
        .post('/api/v1/users')
        .send({
          email: 'admin2@salud.gob.sv',
          password: 'admin',
          perfiles: [10],
        })
        .set('Authorization', `Bearer ${token}`)
        .then((response) => {
          expect(response).to.have.status(201);
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
          expect(response).to.have.status(422);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('Test de update email [put] /api/v1/users/update/email, caso de error: sin envio de token', (done) => {
      chai.request(url)
        .put('/api/v1/users/update/email')
        .send({
          email: 'admin1@salud.gob.sv',
          password: 'admin',
        })
        .set('Authorization', 'Bearer')
        .then((response) => {
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
          expect(response).to.have.status(200);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe('Test de post de usuarios', () => {
    beforeEach((done) => {
      // se ejecuta antes de cada prueba en este bloque
      chai.request(url)
        .post('/api/v1/login')
        .send({
          email: 'admin1@salud.gob.sv',
          password: 'admin',
        })
        .end((err, res) => {
          token = res.body.token;

          expect(res).to.have.status(200);
          done();
        });
    });
    it('Test de post [post] /api/v1/users, caso de error: se debe poseer un perfil asignado', (done) => {
      chai.request(url)
        .post('/api/v1/users')
        .send({
          email: 'admin2@salud.gob.sv',
          password: 'admin',
          roles: [2],
        })
        .set('Authorization', `Bearer ${token}`)
        .then((response) => {
          expect(response).to.have.status(400);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe('Test de verificacion de expiracion de token', () => {
    beforeEach((done) => {
      // se ejecuta antes de cada prueba en este bloque
      chai.request(url)
        .post('/api/v1/login')
        .send({
          email: 'admin1@salud.gob.sv',
          password: 'admin',
        })
        .end((err, res) => {
          token = res.body.token;

          expect(res).to.have.status(200);
          done();
        });
    });
    afterEach((done) => {
      // se ejecuta antes de cada prueba en este bloque
      chai.request(url)
        .post('/api/v1/login')
        .send({
          email: 'admin1@salud.gob.sv',
          password: 'admin',
        })
        .end((err, res) => {
          token = res.body.token;

          expect(res).to.have.status(401);
          done();
        });
    });
    it('Test de verificacion de token, caso de error: token debe expirar al actualizar datos', (done) => {
      chai.request(url)
        .put('/api/v1/users/update/email')
        .send({
          email: 'admin@salud.gob.sv',
          password: 'admin',
        })
        .set('Authorization', `Bearer ${token}`)
        .then((response) => {
          expect(response).to.have.status(200);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe('Test de cambio de contraseña de usuarios', () => {
    beforeEach((done) => {
      // se ejecuta antes de cada prueba en este bloque
      chai.request(url)
        .post('/api/v1/login')
        .send({
          email: 'admin@salud.gob.sv',
          password: 'admin',
        })
        .end((err, res) => {
          token = res.body.token;

          expect(res).to.have.status(200);
          done();
        });
    });
    it('Test de verificacion de cambio de contraseña, caso de error: contraseña proporcionada no es correcta', (done) => {
      chai.request(url)
        .put('/api/v1/users/update/password')
        .send({
          password_actual: 'admin1',
          password: 'Administrador1',
          confirm_password: 'Administrador1',
        })
        .set('Authorization', `Bearer ${token}`)
        .then((response) => {
          expect(response).to.have.status(403);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    it('Test de verificacion de cambio de contraseña, caso de error: las contraseñas no coinciden', (done) => {
      chai.request(url)
        .put('/api/v1/users/update/password')
        .send({
          password_actual: 'admin1',
          password: 'Administrador1',
          confirm_password: 'Administrador',
        })
        .set('Authorization', `Bearer ${token}`)
        .then((response) => {
          expect(response).to.have.status(403);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
