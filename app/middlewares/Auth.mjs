import NoAuthException from "../../handlers/NoAuthException.mjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.mjs";

const Auth = async (req, res, next) => {
    try {
        let authorization = req.headers.authorization
        if (!authorization)
            throw new NoAuthException()
        authorization = authorization.split(' ')
        if (authorization.length < 2)
            throw new NoAuthException()

        const token = authorization[1]

        const {id} = jwt.verify(token, process.env.SECRET_KEY)
        const usuario = await Usuario.findOne({id: id})
        if (!usuario.active)
            throw new NoAuthException()

        req.usuario = usuario
        next()
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            message: err.message
        })
    }
}

export default Auth