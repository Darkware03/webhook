import PerfilRol from "../models/PerfilRol.mjs";
import HttpCode from "../../configs/httpCode.mjs";
import WS from '../services/WS.mjs'

export default class PerfilController {

    static async index(req, res) {
        try {
            const perfiles_roles = await PerfilRol.findAll()
            return res.status(HttpCode.HTTP_OK).json(perfiles_roles)
        } catch (error) {
            console.error(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"})
        }
    }

    static async store(req, res) {
        const { id_perfil, id_rol } = req.body
        try {
        const perfil_rol = await PerfilRol.create({
            id_perfil, 
            id_rol
        })

        WS.emit("new_perfil_rol", perfil_rol)
        return res.status(HttpCode.HTTP_CREATED).json(perfil_rol)
        } catch (error) {
            console.error(error)
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"})
        }
    }

    static async show(req, res) {
        try {
            const perfil_rol = await PerfilRol.findOne({
                where: {
                    id: req.params.id
                }
            })
            return res.status(HttpCode.HTTP_OK).json(perfil_rol)
        } catch (error) {
            console.error(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"})
        }
    }


    static async update(req, res) {
        try {
            const {id_perfil, id_rol} = req.body

            const perfil_rol = await Perfil.update({
                id_perfil, 
                id_rol
            }, {
                where: {
                    id: req.params.id
                },
                returning: [ 'id_perfil', 'id_rol']
            })
            return res.status(HttpCode.HTTP_OK).json(perfil_rol[1])
        } catch (error) {
            console.error(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"})
        }
    }

    static async destroy(req, res) {
        try {
            await PerfilRol.destroy({
                where: {
                    id: req.params.id
                },
            })
            return res.status(HttpCode.HTTP_OK).json({
                message: 'Perfil Rol Eliminado'
            })
        } catch (error) {
            console.error(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"}); 
        }
    }
}

