import Usuario from "../models/Usuario.mjs";
import HttpCode from "../../configs/httpCode.mjs";
import bcrypt from 'bcryptjs'
import WS from '../services/WS.mjs'

export default class UsuarioController {

    static async index(req, res) {
        const usuarios = await Usuario.findAll()
        return res.status(HttpCode.HTTP_OK).json(usuarios)
    }

    static async store(req, res) {
        const {email, password} = req.body
        const salt = bcrypt.genSaltSync()
        const password_crypt = bcrypt.hashSync(password, salt)

        const usuario = await Usuario.create({
            email, password: password_crypt
        })

        WS.emit("new_user", usuario)

        return res.status(HttpCode.HTTP_CREATED).json(usuario)
    }

    static async show(req, res) {
        const usuario = await Usuario.findOne({
            where: {
                id: req.params.id
            }
        })

        return res.status(HttpCode.HTTP_OK).json(usuario)
    }


    static async update(req, res) {
        const {name, last_name, email} = req.body

        const usuario = await Usuario.update({
            name, last_name, email
        }, {
            where: {
                id: req.params.id
            },
            returning: ['name', 'last_name', 'email']
        })


        return res.status(HttpCode.HTTP_OK).json(usuario[1])
    }

    static async destroy(req, res) {

        await Usuario.update({
            active: false
        }, {
            where: {
                id: req.params.id
            },
        })

        return res.status(HttpCode.HTTP_OK).json({
            message: 'Usuario Eliminado'
        })
    }
}

