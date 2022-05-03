/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line import/no-extraneous-dependencies
import { it, describe } from 'mocha';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import url from './config.mjs';

chai.use(chaiHttp);

describe('Inicializando pruebas para /api/v1/rutas', () => {
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

  it('Test de get rutas [get] /api/v1/rutas, caso exitoso', (done) => {
    chai.request(url)
      .get('/api/v1/rutas')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response).to.have.status(200);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('Test de post rutas [post] /api/v1/rutas, caso exitoso', (done) => {
    chai.request(url)
      .post('/api/v1/rutas')
      .send({
        nombre: 'Ruta_prueba',
        uri: '/prueba',
        nombre_uri: 'Ruta',
        mostrar: true,
        icono: 'mdi_home',
        orden: 5,
        admin: true,
        publico: false,
        id_ruta_padre: 0,
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

  it('Test de post rutas [post] /api/v1/rutas, parametro incorrecto', (done) => {
    chai.request(url)
      .post('/api/v1/rutas')
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

  it('Test de update rutas [put] /api/v1/rutas/:id, Parametro correcto', (done) => {
    chai.request(url)
      .put(`/api/v1/rutas/${idPrueba}`)
      .send({
        nombre: 'RutaPrueba',
        uri: '/prueba',
        nombre_uri: 'Ruta',
        mostrar: true,
        icono: 'mdi_home',
        orden: 5,
        admin: true,
        publico: false,
        id_ruta_padre: 0,
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

  it('Test de update rutas [put] /api/v1/rutas/:id, parametro incorrecto', (done) => {
    chai.request(url)
      .put(`/api/v1/rutas/${idPrueba}`)
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

  it('Test de delete rutas [delete] /api/v1/rutas/:id, parametro correcto', (done) => {
    chai.request(url)
      .delete(`/api/v1/rutas/${idPrueba}`)
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
