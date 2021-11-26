import {Server as io} from "socket.io";
import Server from "../../configs/server.mjs";

let instance = null
let count=0
class WS {
    constructor() {
        if (!instance)
            instance = new io(Server.server, {
                cors: {
                    origin: '*'
                }
            })
        this.valid()
        return instance
    }

    valid() {

        instance.on('connection', socket => {
            count++
            if(count>=2)
                socket.disconnect(true)
            console.log(count)
        })
    }
}

export default new WS()

