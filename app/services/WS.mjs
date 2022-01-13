import { Server as IO } from 'socket.io';
import jwt from 'jsonwebtoken';
import Server from '../../configs/server.mjs';
import Usuario from '../models/Usuario.mjs';

let instance = null;

class WS {
  constructor() {
    if (!instance) {
      instance = new IO(Server.server, {
        cors: {
          origin: '*',
        },
      });
    }
    this.valid();
    // eslint-disable-next-line no-constructor-return
    return instance;
  }

  // eslint-disable-next-line class-methods-use-this
  valid() {
    instance.use(async (socket, next) => {
      try {
        const { token } = socket.handshake.auth;

        if (!token) socket.disconnect();
        const { id } = jwt.verify(token, process.env.SECRET_KEY);

        const usuario = await Usuario.findOne({ id });
        if (usuario) {
          next();
        } else {
          const err = new Error('Not Authorized');
          err.data = { content: 'Intente mas tarde' };
          next(err);
        }
      } catch (e) {
        next(e);
      }
    });
  }
}

export default new WS();
