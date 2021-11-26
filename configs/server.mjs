import express from 'express'
import NotFoundExeption from "../handlers/NotFoundExeption.mjs";
import Handler from "../handlers/Handler.mjs";
import UsuarioController from "../app/controllers/UsuarioController.mjs";
import Route from "../app/nucleo/Route.mjs";

let ObjectServer = null

export default class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 8000;
        this.middlewares()
        this.routes()
        this.ExceptionConfig()

        if (!ObjectServer)
            ObjectServer = this
        return ObjectServer
    }

    middlewares() {
        this.app.use(express.json())
    }

    ExceptionConfig() {
        this.app.use(Handler.logErrorMiddleware)
        this.app.use(Handler.handlerError)
    }

    routes() {
        const route = new Route(this)
        route.get('/users', UsuarioController.index)
        route.post('/users',UsuarioController.store)
        route.put('/users/:id',UsuarioController.update)
        route.delete('/users/:id',UsuarioController.destroy)

        route.notFound('*')

        /*this.app.post('/user', UsuarioController.store)
        this.app.get('/user/:id', UsuarioController.show)

        this.app.all('*', () => {
            throw new NotFoundExeption()
        })*/
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Corriendo en http://localhost:${this.port}`);
        });
    }
}
