import UsuarioPerfil from "../models/UsuarioPerfil.mjs";
import HttpCode from "../../configs/httpCode.mjs";
import bcrypt from 'bcryptjs'
import WS from '../services/WS.mjs'

export default class UsuarioPerfilController {

    static async index(req, res) {
        try {
            const usuarios_perfil = await UsuarioPerfil.findAll()
            return res.status(HttpCode.HTTP_OK).json(usuarios_perfil)
        } catch (error) {
            console.error(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"}); 
        }
    }

    static async store(req, res) {
        try {
            const {id_perfil, id_usuario} = req.body
            const salt = bcrypt.genSaltSync()
    
            const usuario_perfil = await UsuarioPerfil.create({
                id_perfil, 
                id_usuario
            })
    
            WS.emit("new_usuario_perfil", usuario_perfil)
    
            return res.status(HttpCode.HTTP_CREATED).json(usuario_perfil)
        } catch (error) {
            console.error(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"}); 
        }
    }

    static async show(req, res) {
        try {
            const usuario_perfil = await UsuarioPerfil.findOne({
                where: {
                    id: req.params.id
                }
            })
    
            return res.status(HttpCode.HTTP_OK).json(usuario_perfil); 
        } catch (error) {
            console.error(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"}); 
        }
    }


    static async update(req, res) {
        const {id_perfil, id_usuario} = req.body
        try {
            const usuario_perfil = await UsuarioPerfil.update({
                id_perfil, 
                id_usuario
            }, {
                where: {
                    id: req.params.id
                },
                returning: ['id_perfil', 'id_usuario']
            })
            return res.status(HttpCode.HTTP_OK).json(usuario_perfil[1])
        } catch (error) {
            console.error(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"}); 
        }
    }

    static async destroy(req, res) {
        try {
            await UsuarioPerfil.update({
                active: false
            }, {
                where: {
                    id: req.params.id
                },
            })
    
            return res.status(HttpCode.HTTP_OK).json({
                message: 'Usuario Perfil Eliminado'
            })
        } catch (error) {
            console.error(error);
            return res.status(HttpCode.HTTP_INTERNAL_SERVER_ERROR).json({"msj": "Error al procesar la petición"}); 
        }
    }
}

