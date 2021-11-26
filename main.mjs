import api from "./routes/api.mjs";
import Handler from "./handlers/Handler.mjs";
import Server from "./configs/server.mjs";

export default class Main {
    constructor() {
        this.server = Server
        this.server.start()
        this.routes()
        this.ExceptionConfig()
    }

    routes() {
        this.server.app.get('/', (req, res)=>{
            res.send('<H2>HOLA MUNDO</H2>')
        })
        api()
    }

    ExceptionConfig() {
        this.server.app.use(Handler.logErrorMiddleware)
        this.server.app.use(Handler.handlerError)
    }

}