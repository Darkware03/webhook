import { it, describe } from 'mocha';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import url from './config.mjs';

chai.use(chaiHttp);

describe('Test de Perfil', () => {
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
});
