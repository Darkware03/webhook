import Usuario from "../models/Usuario.mjs";
import HttpCode from "../../configs/httpCode.mjs";
import bcrypt from 'bcryptjs'
import NoAuthException from "../../handlers/NoAuthException.mjs";
import GenerarJwt from "../utils/GenerarJwt.mjs";

export default class LoginController {
    static async login(req, res) {
        const {email, password} = req.body

        const usuario = await Usuario.findOne({
            where: {
                email
            }
        })

        if (!usuario) throw new NoAuthException('UNAUTHORIZED', HttpCode.HTTP_UNAUTHORIZED, 'Credenciales no validas')

        const valid_password = bcrypt.compareSync(password, usuario.password)
        if (!valid_password) {
            throw new NoAuthException('UNAUTHORIZED', HttpCode.HTTP_UNAUTHORIZED, 'Credenciales no validas')
        }


        const token = await GenerarJwt.create({
            id: usuario.id,
            email: usuario.email,
            name: usuario.username,
            last_name: usuario.last_name
        })

        return res.status(HttpCode.HTTP_OK).json({
            token
        })

    }
}