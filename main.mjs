import api from "./routes/api.mjs";
import web from './routes/web.mjs'
import Handler from "./handlers/Handler.mjs";
import Server from "./configs/server.mjs";
import NotFoundExeption from "./handlers/NotFoundExeption.mjs";

export default class Main {
    constructor() {
        this.server = Server
        this.server.start()
        this.routes()
        this.ExceptionConfig()
    }

    routes() {
        this.server.app.use('/', web)
        this.server.app.use('/api', api)
        this.server.app.all('*', () => {
            throw new NotFoundExeption()
        })
    }

    ExceptionConfig() {
        this.server.app.use(Handler.logErrorMiddleware)
        this.server.app.use(Handler.handlerError)
    }

}