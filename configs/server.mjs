import express from 'express'
import {createServer} from "http";

let instance = null

class Server {

    constructor() {
        if (!instance) {
            instance = this
        }
        this.app = express();
        this.server = createServer(this.app)
        this.port = process.env.PORT || 8000;
        this.host = process.env.HOST || 'localhost'
        this.middlewares()
        return instance
    }

    middlewares() {
        this.app.use(express.json())
    }

    start() {
        this.server.listen(this.port, this.host, () => {
            console.log(`http://${this.host}:${this.port}`);
        });
    }
}

export default new Server()