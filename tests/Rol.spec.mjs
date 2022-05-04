/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line import/no-extraneous-dependencies
import { it, describe } from 'mocha';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import url from './config.mjs';

chai.use(chaiHttp);

describe('Inicializando pruebas para /api/v1/roles', () => {
  let token;
  let idPrueba;

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
  it('Test de get roles [get] /api/v1/roles, caso exitoso', (done) => {
    chai.request(url)
      .get('/api/v1/roles')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response).to.have.status(200);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('Test de get rol especifico [get] /api/v1/roles/:id, caso exitoso', (done) => {
    chai.request(url)
      .get('/api/v1/roles/55')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response).to.have.status(200);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('Test de post roles [post] /api/v1/roles, caso exitoso', (done) => {
    chai.request(url)
      .post('/api/v1/roles')
      .send({
        name: 'ROL_PRUEBaaa22',
        idTipoRol: 1,
      })
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        idPrueba = response.body.id;
        expect(response).to.have.status(201);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('Test de post roles [post] /api/v1/roles/, paramtro incorrecto', (done) => {
    chai.request(url)
      .post('/api/v1/roles')
      .send({
        nam: 'ROL_PRUEBaaa',
        idTipoRol: 1,
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

  it('Test de update roles [put] /api/v1/roles/:id, Parametro correcto', (done) => {
    chai.request(url)
      .put(`/api/v1/roles/${idPrueba}`)
      .send({
        name: 'ROL_PRUEBA',
        id_tipo_rol: 1,
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

  it('Test de update roles [put] /api/v1/roles/:id, parametro incorrecto', (done) => {
    chai.request(url)
      .put(`/api/v1/roles/${idPrueba}`)
      .send({
        nam: 'ROL_PRUEBA',
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

  it('Test de delete roles [delete] /api/v1/roles/:id, parametro correcto', (done) => {
    chai.request(url)
      .delete(`/api/v1/roles/${idPrueba}`)
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
