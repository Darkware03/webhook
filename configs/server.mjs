import express from 'express'
import NoAuthException from "../handlers/NoAuthException.mjs";
import Handler from "../handlers/Handler.mjs";
import DB from "../app/nucleo/DB.mjs";

export default class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 8000;
        this.routes()
        this.middlewares()
        DB.conection('postgres')
        // throw new NoAuthException()
    }

    middlewares() {
        this.app.use(Handler.logErrorMiddleware)
        this.app.use(Handler.handlerError)
    }
    prueba(){
        throw new NoAuthException('prueba', 400, 'bat request')
    }
    routes() {
        this.app.post('/user', async (req, res, next) => {
            try{
                this.prueba()
                return res.status(200).send("prueba")
            }catch (error) {
                next(error)
            }
        })
        this.app.all('*', ()=>{

        })
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Corriendo en http://localhost:${this.port}`);
        });
    }
}
