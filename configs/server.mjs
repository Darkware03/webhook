import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import fileupload from 'express-fileupload';

class Server {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.port = process.env.PORT || 8000;
    this.host = process.env.HOST || 'localhost';
    this.middlewares();
    this.routes(); // Agregar la configuración de las rutas
    this.start(); // Iniciar el servidor
  }

  middlewares() {
    this.app.use(fileupload({ createParentPath: true }));
    this.app.use(cors());
    this.app.use(express.static('public'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  routes() {
    // Ruta de ejemplo: POST en '/servicelogs'
    this.app.post('/servicelogs', (req, res) => {
      console.log(req.body); // Muestra el cuerpo de la solicitud en la consola
      return res.status(200).json({ message: "SE ACCEDIO." });
    });
    // Puedes añadir más rutas aquí si es necesario
  }

  start() {
    this.server.listen(this.port, this.host, () => {
      console.log(`Servidor Express escuchando en http://${this.host}:${this.port}`);
    });
  }
}

export default new Server();
