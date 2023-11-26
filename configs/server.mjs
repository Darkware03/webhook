import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import fileupload from 'express-fileupload';
import corsConfig from './cors.mjs';
import {Server as ServerIo }  from 'socket.io';

class Server {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.port = process.env.PORT || 8000;

    this.host = process.env.HOST || 'localhost';
    this.middlewares();
  }
  middlewares() {
    this.app.use(fileupload({
      createParentPath: true,
    }));
    this.app.use(cors());
    this.app.use(express.static('public'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  routes() {
    // Ruta de ejemplo: GET en '/saludo'
    this.app.get('/servicelogs', (req, res) => {
      console.log(req)
      return res.status(200).json({ message: "SE ACCEDIO." });
    });
    // Puedes añadir más rutas aquí si es necesario
  }
  start() {

    this.server.listen(this.port, this.host, () => {
      // eslint-disable-next-line no-console
      console.log(`http://${this.host}:${this.port}`);
    });
  }
}

export default new Server();
