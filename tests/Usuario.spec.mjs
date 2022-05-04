import { it, describe } from 'mocha';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import moment from 'moment-timezone';
import url from './config.mjs';

chai.use(chaiHttp);
const fecha = moment().format('X');
const email = `admin${fecha}@salud.gob.sv`;
let idUsuario;
const emailUpdate = `admin${fecha}update@salud.gob.sv`;

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
          expect(res).to.have.status(400);
          done();
        });
    });

    it('Test de post [post] /api/v1/users, caso exitoso', (done) => {
      chai.request(url)
        .post('/api/v1/users')
        .send({
          email,
          password: 'admin',
          perfiles: [1],
        })
        .set('Authorization', `Bearer ${token}`)
        .then((response) => {
          idUsuario = response.body.id;
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
          email: emailUpdate,
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
  });

  describe('Test de post de usuarios', () => {
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
    it('Test de post [post] /api/v1/users, caso de error: se debe poseer un perfil asignado', (done) => {
      chai.request(url)
        .post('/api/v1/users')
        .send({
          email,
          password: 'admin',
          // roles: [1],
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
    it('Test de put [put] /api/v1/users, caso de exito: cambio de estado suspendido', (done) => {
      chai.request(url)
        .put(`/api/v1/users/${idUsuario}`)
        .send({
          is_suspended: false,
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
          email,
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
    it('Test de delete roles user [delete] /api/v1/users/:id_usuario/roles, caso de error: el parametro no es un id valido', (done) => {
      chai.request(url)
        .delete('/api/v1/users/2a/roles')
        .set('Authorization', `Bearer ${token}`)
        .then((response) => {
          expect(response).to.have.status(422);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    it('Test de delete roles user [delete] /api/v1/users/:id_usuario/roles, caso exitoso', (done) => {
      chai.request(url)
        .delete('/api/v1/users/2/roles')
        .set('Authorization', `Bearer ${token}`)
        .then((response) => {
          expect(response).to.have.status(200);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    it('Test de post [post] /api/v1/users/2fa/add/verify, caso de error: El usuario no tiene este metodo de autenticacion asociado', (done) => {
      chai.request(url)
        .post('/api/v1/users/2fa/add/verify')
        .send({
          id_metodo: 2,
          codigo: '1234',
        })
        .set('Authorization', `Bearer ${token}`)
        .then((response) => {
          expect(response).to.have.status(404);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    it('Test de post [post] /api/v1/users/2fa/add/verify, caso de error: el codigo proporcionado no es valido', (done) => {
      chai.request(url)
        .post('/api/v1/users/2fa/add/verify')
        .send({
          id_metodo: 1,
          codigo: '1234',
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
    it('Test de delete user [delete] /api/v1/users/:id, caso exitoso', (done) => {
      chai.request(url)
        .delete(`/api/v1/users/${idUsuario}`)
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
});
