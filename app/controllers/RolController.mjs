import {Rol} from "../models/index.mjs";
import HttpCode from "../../configs/httpCode.mjs";

export default class RolController {

    static async index(req, res) {
        const roles = await Rol.findAll()
        return res.status(HttpCode.HTTP_OK).json(roles);
    }

    static async store(req, res) {
        const { name } = req.body

        const rol = await Rol.create({
            name
        })

        return res.status(HttpCode.HTTP_CREATED).json(rol);
    }

    static async show(req, res) {
        const rol = await Rol.findOne({
            where: {
                id: req.params.id
            }
        })

        return res.status(HttpCode.HTTP_OK).json(rol);
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
        return res.status(HttpCode.HTTP_OK).json(rol[1]);
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

