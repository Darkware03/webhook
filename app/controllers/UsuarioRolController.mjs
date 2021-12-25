import UsuarioRol from "../models/UsuarioRol.mjs";
import Rol from "../models/Rol.mjs"
import Usuario from "../models/Usuario.mjs";
import HttpCode from "../../configs/httpCode.mjs";
import WS from '../services/WS.mjs'

export default class UsuarioRolController {

    static async index(req, res) {
        try {
            const usuario_roles = await UsuarioRol.findAll()
            return res.status(HttpCode.HTTP_OK).json(usuario_roles)
        } catch (error) {
            console.error(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"});
        }
    }

    static async store(req, res) {
        const { id_usuario, id_rol } = req.body

        try {
            const user_rol = await UsuarioRol.create({
                id_usuario, 
                id_rol
            })
    
            WS.emit("new_user_rol", user_rol)
    
            return res.status(HttpCode.HTTP_CREATED).json(user_rol)
        } catch (error) {
            console.error(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"});
        }
    }

    static async show(req, res) {
        try {
            const user_rol = await UsuarioRol.findOne({
                where: {
                    id_usuario: req.query.id_usuario,
                    id_rol: req.query.id_rol
                },                
            })
    
            return res.status(HttpCode.HTTP_OK).json(user_rol)
        } catch (error) {
            console.log(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"});
        }
    }


    static async update(req, res) {
        const {name} = req.body

        try {
            const user_rol = await UsuarioRol.update({
                name
            }, {
                where: {
                    id: req.params.id
                },
                returning: ['name']
            })
    
            return res.status(HttpCode.HTTP_OK).json(user_rol[1])
        } catch (error) {
            console.error(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"});
        }
    }

    static async destroy(req, res) {
        try {
            await UsuarioRol.destroy({
                where: {
                    id: req.params.id
                },
            })
    
            return res.status(HttpCode.HTTP_OK).json({
                message: 'Usuario-Rol Eliminado'
            })
        } catch (error) {
            console.log(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"});
        }
    }
}

