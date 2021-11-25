import express from 'express'
import NoAuthException from "../handlers/NoAuthException.mjs";
import NotFoundExeption from "../handlers/NotFoundExeption.mjs";
import Handler from "../handlers/Handler.mjs";

export default class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 8000;
        this.middlewares()
        this.routes()
        this.ExceptionConfig()
    }
    middlewares(){}

    ExceptionConfig() {
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
            throw new NotFoundExeption()
        })
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Corriendo en http://localhost:${this.port}`);
        });
    }
}
