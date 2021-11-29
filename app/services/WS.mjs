import {Server as io} from "socket.io";
import Server from "../../configs/server.mjs";
import Usuario from "../models/Usuario.mjs";
import jwt from 'jsonwebtoken'

let instance = null

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

        instance.use(async (socket, next) => {
            try {
                const {token} = socket.handshake.auth

                if (!token) socket.disconnect()
                const {id} = jwt.verify(token, process.env.SECRET_KEY)

                const usuario = await Usuario.findOne({id: id})
                if (usuario) {
                    next()
                } else {
                    const err = new Error("Not Authorized")
                    err.data = {content: "Intente mas tarde"}
                    next(err)
                }
            } catch (e) {
                next(e)
            }
        })
    }
}

export default new WS()

