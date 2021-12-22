import Rol from "../models/Rol.mjs";
import HttpCode from "../../configs/httpCode.mjs";
import WS from '../services/WS.mjs'

export default class RolController {

    static async index(req, res) {
        try {
            const roles = await Rol.findAll()
            return res.status(HttpCode.HTTP_OK).json(roles)
        } catch (error) {
            console.log(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"})
        }
    }

    static async store(req, res) {
        try {
            const { name } = req.body

            const rol = await Rol.create({
                name
            })
    
            WS.emit("new_rol", rol)
            return res.status(HttpCode.HTTP_CREATED).json(rol)
        } catch (error) {
            console.error(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"})

        }
    }

    static async show(req, res) {
        try {
            const rol = await Rol.findOne({
                where: {
                    id: req.params.id
                }
            })
    
            return res.status(HttpCode.HTTP_OK).json(rol)
        } catch (error) {
            console.error(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"});
        }
    }


    static async update(req, res) {
        const {name} = req.body

        try {
            const rol = await Rol.update({
                name
            }, {
                where: {
                    id: req.params.id
                },
                returning: ['name']
            })
            return res.status(HttpCode.HTTP_OK).json(rol[1])
        } catch (error) {
            console.error(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"});
        }
    }

    static async destroy(req, res) {
        try {
            await Rol.destroy({
                where: {
                    id: req.params.id
                },
            })
    
            return res.status(HttpCode.HTTP_OK).json({
                message: 'Rol Eliminado'
            })
        } catch (error) {
            console.log(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"});
        }
    }
}

