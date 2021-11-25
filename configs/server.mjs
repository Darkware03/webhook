import express from 'express'
import NotFoundExeption from "../handlers/NotFoundExeption.mjs";
import Handler from "../handlers/Handler.mjs";
import UsuarioController from "../app/controllers/UsuarioController.mjs";

export default class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 8000;
        this.middlewares()
        this.routes()
        this.ExceptionConfig()
    }

    middlewares() {
        this.app.use(express.json())
    }

    ExceptionConfig() {
        this.app.use(Handler.logErrorMiddleware)
        this.app.use(Handler.handlerError)
    }

    routes() {
        this.app.get('/user', UsuarioController.index)
        this.app.post('/user', UsuarioController.store)
        this.app.get('/user/:id', UsuarioController.show)

        this.app.all('*', () => {
            throw new NotFoundExeption()
        })
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Corriendo en http://localhost:${this.port}`);
        });
    }
}
