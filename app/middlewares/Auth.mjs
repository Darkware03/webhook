import NoAuthException from "../../handlers/NoAuthException.mjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.mjs";
import HttpCode from "../../configs/httpCode.mjs";

const Auth = async (req, res, next) => {
    try {
        let authorization = req.headers.authorization
        if (!authorization)
            new NoAuthException()
        authorization = authorization.split(' ')
        if (authorization.length < 2)
            new NoAuthException()

        const token = authorization[1]

        const {id} = jwt.verify(token, process.env.SECRET_KEY)

        const usuario = await Usuario.findOne({
            where: {id: id, is_suspended: false}
        })

        if (usuario.is_suspended)
            new NoAuthException()

        req.usuario = usuario
        next()
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(HttpCode.HTTP_UNAUTHORIZED).json({
                message: 'No authenticado'
            })
        }
        return res.status(err.statusCode || 500).json({
            message: err
        })
    }
}

export default Auth