import NoAuthException from "../../handlers/NoAuthException.mjs";
import jwt from "jsonwebtoken";
import {Usuario} from "../models/index.mjs";
import HttpCode from "../../configs/httpCode.mjs";

const Auth = async (req, res, next) => {
    try {
        let authorization = req.headers.authorization
        if (!authorization)
            next(new NoAuthException())

        authorization = authorization.split(' ')
        if (authorization.length < 2)
            next(new NoAuthException())

        const token = authorization[1]

        const {id} = jwt.verify(token, process.env.SECRET_KEY)

        const usuario = await Usuario.findOne({
            where: {id: id, is_suspended: false}
        })

        if (usuario.is_suspended)
            next(new NoAuthException())

        req.usuario = usuario
        next()
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(HttpCode.HTTP_UNAUTHORIZED).json({
                message: 'No authenticado'
            })
        }
    }
}

export default Auth