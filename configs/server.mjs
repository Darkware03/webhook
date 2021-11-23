import express from 'express'

export default class Server{
    constructor(){
        this.app = express(); 
        this.port = process.env.PORT || 8080;
        
    }

    middlewares() {
        
    }

    routes(){
        
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Corriendo en http://localhost:${this.port}`);
        });
    }
}
