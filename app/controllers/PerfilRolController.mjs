import {PerfilRol} from "../models/index.mjs";
import HttpCode from "../../configs/httpCode.mjs";
// import WS from '../services/WS.mjs'

export default class PerfilController {

    static async index(req, res) {
        const perfiles_roles = await PerfilRol.findAll()
        return res.status(HttpCode.HTTP_OK).json(perfiles_roles);
    }

    static async store(req, res) {
        const { id_perfil, id_rol } = req.body
        const perfil_rol = await PerfilRol.create({
            id_perfil, 
            id_rol
        }, {fields: ['id_perfil', 'id_rol']})

        // WS.emit("new_perfil_rol", perfil_rol)
        return res.status(HttpCode.HTTP_CREATED).json(perfil_rol);
    }

    static async show(req, res) {
        const perfil_rol = await PerfilRol.findOne({
            where: {
                id: req.params.id
            }
        })
        return res.status(HttpCode.HTTP_OK).json(perfil_rol);
    }


    static async update(req, res) {
        const {id_perfil, id_rol} = req.body

        const perfil_rol = await PerfilRol.update({
            id_perfil, 
            id_rol
        }, {
            where: {
                id: req.params.id
            },
            returning: [ 'id_perfil', 'id_rol']
        })
        return res.status(HttpCode.HTTP_OK).json(perfil_rol[1]);
    }

    static async destroy(req, res) {
        await PerfilRol.destroy({
            where: {
                id: req.params.id
            },
        })
        return res.status(HttpCode.HTTP_OK).json({
            message: 'Perfil Rol Eliminado'
        })
    }
}

