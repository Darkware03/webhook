import UsuarioRol from "../models/UsuarioRol.mjs";
import HttpCode from "../../configs/httpCode.mjs";
import WS from '../services/WS.mjs'

export default class UsuarioRolController {

    static async index(req, res) {
        const usuario_roles = await UsuarioRol.findAll()
        return res.status(HttpCode.HTTP_OK).json(usuario_roles)
    }

    static async store(req, res) {
        const { name } = req.body

        const user_rol = await UsuarioRol.create({
            name
        })

        WS.emit("new_user_rol", user_rol)

        return res.status(HttpCode.HTTP_CREATED).json(user_rol)
    }

    static async show(req, res) {
        const rol = await Rol.findOne({
            where: {
                id: req.params.id
            }
        })

        return res.status(HttpCode.HTTP_OK).json(rol)
    }


    static async update(req, res) {
        const {name} = req.body

        const rol = await Rol.update({
            name
        }, {
            where: {
                id: req.params.id
            },
            returning: ['name']
        })

        return res.status(HttpCode.HTTP_OK).json(rol[1])
    }

    static async destroy(req, res) {
        await Rol.destroy({
            where: {
                id: req.params.id
            },
        })

        return res.status(HttpCode.HTTP_OK).json({
            message: 'Rol Eliminado'
        })
    }
}

