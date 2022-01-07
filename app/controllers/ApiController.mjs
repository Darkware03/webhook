import {Usuario, Perfil, Rol} from "../models/index.mjs";
import HttpCode from "../../configs/httpCode.mjs";
import bcrypt from 'bcryptjs'
import NoAuthException from "../../handlers/NoAuthException.mjs";
import Auth from "../utils/Auth.mjs";
import moment from "moment-timezone";
import {RefreshToken} from "../models/index.mjs";
import BaseError from "../../handlers/BaseError.mjs";


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

    static async RefreshToken(req, res) {
        const refreshTokenExist = await RefreshToken.findOne({
            where: {
                refresh_token: req.body.refresh_token
            },
            attributes: [],
            include: [
                {
                    model: Usuario,
                    attributes: ['id', 'email', 'last_login'],
                    include: [{
                        model: Rol,
                        attributes: ['name'],
                        through: {attributes: []}
                    }, {
                        model: Perfil,
                        attributes: {exclude: ['nombre', 'codigo']},
                        through: {attributes: []},
                        include: [{
                            model: Rol,
                            attributes: ['name'],
                            through: {attributes: []}
                        }]
                    }]
                }]
        })

        if (!refreshTokenExist) throw new BaseError('NOT_FOUND', HttpCode.HTTP_BAD_REQUEST, 'Error al realizar la peticion...')

        const roles_perfiles = refreshTokenExist.Usuario.Perfils.reduce((acumulador, valor) => acumulador = [...valor.Rols], [])

        let roles = new Set(refreshTokenExist.Usuario.Rols.concat(roles_perfiles).map(row => row.name))

        const tokenValidTime = new Date(moment(refreshTokenExist.valid).format()).getTime();
        const nowTime = new Date(moment().tz('America/El_Salvador').format()).getTime();
        if (tokenValidTime < nowTime) throw new NoAuthException('UNAUTHORIZED', HttpCode.HTTP_UNAUTHORIZED, 'El refresh token porporcionado no es valido')
        const token = await Auth.createToken({
            email: refreshTokenExist.Usuario.email,
            roles: [...roles],
        })

        const newRefreshToken = await Auth.refresh_token(refreshTokenExist.Usuario)

        await refreshTokenExist.update({
            valid:moment().add(process.env.REFRESH_TOKEN_INVALID_EXPIRATION_TIME, process.env.REFRESH_TOKEN_INVALID_EXPIRATION_TYPE).tz('America/El_Salvador').format()
        })

        return res.status(HttpCode.HTTP_OK).json({
            token,
            refresh_token: newRefreshToken,
            user: refreshTokenExist.Usuario
        })
    }
}