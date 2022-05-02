/* eslint-disable import/no-extraneous-dependencies */
import { it, describe } from 'mocha';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import url from './config.mjs';

chai.use(chaiHttp);

describe('Test de Perfil', () => {
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
  it('Test de get perfiles [get] /api/v1/perfiles, caso exitoso', (done) => {
    chai.request(url)
      .get('/api/v1/perfiles')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response).to.have.status(200);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  it('Test de get perfil especifico [get] /api/v1/perfiles/:id, caso exitoso', (done) => {
    chai.request(url)
      .get('/api/v1/perfiles/1')
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
  it('Test de post perfiles [post] /api/v1/perfiles, caso exitoso', (done) => {
    chai.request(url)
      .post('/api/v1/perfiles')
      .send({
        nombre: 'PRUEBaaa22',
        codigo: '6',
        roles: [2],
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

  it('Test de post perfiles [post] /api/v1/perfiles/, parametro incorrecto', (done) => {
    chai.request(url)
      .post('/api/v1/perfiles')
      .send({
        nombe: 'PRUEBaaa22',
        codig: '1',
      })
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        // console.log(response.body.data);
        expect(response).to.have.status(400);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('Test de update perfiles [put] /api/v1/perfiles/:id, Parametro correcto', (done) => {
    chai.request(url)
      .put(`/api/v1/perfiles/${idPrueba}`)
      .send({
        nombre: 'Prueba',
        codigo: '1',
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

  /*   it('Test de update perfiles [put] /api/v1/perfiles/:id, parametro incorrecto', (done) => {
    chai.request(url)
      .put(`/api/v1/perfiles/${idPrueba}`)
      .send({
        nmbre: 'Prueba',
        odigo: '28',
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
  }); */

  it('Test de delete perfiles [delete] /api/v1/perfiles/:id/roles, parametro correcto', (done) => {
    chai.request(url)
      .delete(`/api/v1/perfiles/${idPrueba}/roles`)
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

  it('Test de delete perfilRol [delete] /api/v1/perfiles/:id, parametro correcto', (done) => {
    chai.request(url)
      .delete(`/api/v1/perfiles/${idPrueba}`)
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
