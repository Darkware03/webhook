import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import corsConfig from './cors.mjs';

class Server {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.port = process.env.PORT || 8000;

    this.host = process.env.HOST || 'localhost';
    this.middlewares();
  }

  middlewares() {
    this.app.use(cors(corsConfig));
    this.app.use(express.static('public'));
    this.app.use(express.json());
  }

  start() {
    this.server.listen(this.port, this.host, () => {
      // eslint-disable-next-line no-console
      console.log(`http://${this.host}:${this.port}`);
    });
  }
}

export default new Server();
