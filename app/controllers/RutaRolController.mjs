import RutaRol from "../models/RutaRol.mjs";
import HttpCode from "../../configs/httpCode.mjs";
import WS from '../services/WS.mjs'

export default class RutaRolController {

    static async index(req, res) {
        try {
            const rutasRoles = await RutaRol.findAll()
            return res.status(HttpCode.HTTP_OK).json(rutasRoles)
        } catch (error) {
            console.error(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"});
        }
    }

    static async store(req, res) {
        const { id_ruta, id_rol } = req.body

        try {
            const ruta_rol = await RutaRol.create({
                id_ruta, 
                id_rol
            })
    
            WS.emit("new_ruta_rol", ruta_rol)
    
            return res.status(HttpCode.HTTP_CREATED).json(ruta_rol)
        } catch (error) {
            console.log(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"});
        }
    }

    static async show(req, res) {
        try {
            const ruta_rol = await RutaRol.findOne({
                where: {
                    id: req.params.id
                }
            })
    
            return res.status(HttpCode.HTTP_OK).json(ruta_rol)
        } catch (error) {
            console.error(error); 
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"});
        }
    }


    static async update(req, res) {
        const { id_ruta, id_rol } = req.body
        try {
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
        } catch (error) {
            console.error(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"});
        }
    }

    static async destroy(req, res) {
        try {
            await RutaRol.destroy({
                where: {
                    id: req.params.id
                },
            })
    
            return res.status(HttpCode.HTTP_OK).json({
                message: 'Ruta_Rol Eliminado'
            })
        } catch (error) {
            console.error(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"});
        }
    }
}

