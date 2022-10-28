/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import { Server as IO } from 'socket.io';
import jwt from 'jsonwebtoken';
import Server from '../../configs/server.mjs';
import Usuario from '../models/Usuario.mjs';
import wsCors from '../../configs/wsCors.mjs';

export default class WebSocketServer extends IO {
  static _instance;

  static events = [];

  static getInstance() {
    if (!this._instance) {
      this._instance = new WebSocketServer(Server.server, {
        cors: wsCors,
        allowEIO3: true,
      });
    }
    this.valid();
    return this._instance;
  }

  static valid() {
    this._instance.use(async (socket, next) => {
      try {
        const { token } = socket.handshake.auth;

        if (!token) socket.disconnect();
        const { user } = jwt.verify(token, process.env.SECRET_KEY);

        const usuario = await Usuario.findOne({ id: user?.id });
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

  static async connection() {
    this._instance.on('connection', async (socket) => {
      const { token } = socket.handshake.auth;
      const { user: usuario } = jwt.verify(token, process.env.SECRET_KEY);
      // Codigo que se ejecutará cuando se realice una conexión

      socket.id_usuario = usuario.id;
      this.executeEvents(socket);
    });
  }

  static executeEvents(socket) {
    this.events.forEach((fn) => fn(socket));
  }

  static use(callback) {
    this.events.push(callback);
  }
}
