import Usuario from "../models/Usuario.mjs";
import HttpCode from "../../configs/httpCode.mjs";
import bcrypt from 'bcryptjs'
import NoAuthException from "../../handlers/NoAuthException.mjs";
import Auth from "../utils/Auth.mjs";
import moment from "moment-timezone";

export default class ApiController {
    static async login(req, res) {
        const {email, password} = req.body

        const usuario = await Usuario.findOne({
            where: {
                email,
                is_suspended: false
            }
        })

        if (!usuario) throw new NoAuthException('UNAUTHORIZED', HttpCode.HTTP_UNAUTHORIZED, 'Credenciales no validas')

        const valid_password = bcrypt.compareSync(password, usuario.password)
        if (!valid_password) {
            throw new NoAuthException('UNAUTHORIZED', HttpCode.HTTP_UNAUTHORIZED, 'Credenciales no validas')
        }

    await usuario.update({last_login: moment().tz('America/El_Salvador').format()})

        const token = await Auth.createToken({
            id: usuario.id,
            email: usuario.email,
        })
        const refresh_token = await Auth.refresh_token(usuario)

        return res.status(HttpCode.HTTP_OK).json({
            token,
            refresh_token,
            user: usuario
        })

    }
}