import express from 'express'
import Handler from "../handlers/Handler.mjs";
import api from "../routes/api.mjs";

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
        api(this)
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Corriendo en http://localhost:${this.port}`);
        });
    }
}
