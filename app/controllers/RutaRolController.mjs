import RutaRol from "../models/RutaRol";
import HttpCode from "../../configs/httpCode.mjs";
import WS from '../services/WS.mjs'

export default class RutaRolController {

    static async index(req, res) {
        const rutasRoles = await RutaRol.findAll()
        return res.status(HttpCode.HTTP_OK).json(rutasRoles)
    }

    static async store(req, res) {
        const { id_ruta, id_rol } = req.body

        const ruta_rol = await RutaRol.create({
            id_ruta, 
            id_rol
        })

        WS.emit("new_ruta_rol", ruta_rol)

        return res.status(HttpCode.HTTP_CREATED).json(ruta_rol)
    }

    static async show(req, res) {
        const ruta_rol = await RutaRol.findOne({
            where: {
                id: req.params.id
            }
        })

        return res.status(HttpCode.HTTP_OK).json(ruta_rol)
    }


    static async update(req, res) {
        const { id_ruta, id_rol } = req.body

        const ruta_rol = await RutaRol.update({
            id_ruta, 
            id_rol
        }, {
            where: {
                id: req.params.id
            },
            returning: ['id_ruta', 'id_rol']
        })

        return res.status(HttpCode.HTTP_OK).json(ruta_rol[1])
    }

    static async destroy(req, res) {
        await RutaRol.destroy({
            where: {
                id: req.params.id
            },
        })

        return res.status(HttpCode.HTTP_OK).json({
            message: 'Ruta_Rol Eliminado'
        })
    }
}

