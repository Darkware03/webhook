import { Server as IO } from 'socket.io';
import Server from '../../configs/server.mjs';

let instance = null;
class WS {
  constructor() {
    if (!instance) {
      instance = new IO(Server.server, {
        cors: {
          origin: '*',
        },
      });
      this.servidor = instance;
    }
    // middlewares(instance);
    // channels(instance);
  }

  getInstance() {
    return this.servidor;
  }
}

export default new WS();
