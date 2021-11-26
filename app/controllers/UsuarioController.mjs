import Usuario from "../models/Usuario.mjs";
import HttpCode from "../../configs/httpCode.mjs";
import bcrypt from 'bcryptjs'

export default class UsuarioController {

    static async index(req, res) {
        const usuarios = await Usuario.findAll()
        return res.status(HttpCode.HTTP_OK).json(usuarios)

    }

    static async store(req, res) {
        const {name, last_name, email, password} = req.body
        const salt = bcrypt.genSaltSync()
        const password_crypt = bcrypt.hashSync(password, salt)

        const usuario = await Usuario.create({
            name, last_name, email, password: password_crypt
        })

        return res.status(HttpCode.HTTP_CREATED).json(usuario)
    }

    static async show(req, res) {
        const usuario = await Usuario.findOne({id: req.params.id})

        return res.status(HttpCode.HTTP_OK).json(usuario)
    }


    static async update(req, res) {

    }

    static async destroy(req, res) {
        // return
    }
}

