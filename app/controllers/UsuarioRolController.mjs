import {UsuarioRol} from "../models/index.mjs";
import HttpCode from "../../configs/httpCode.mjs";

export default class UsuarioRolController {

    static async index(req, res) {
        const usuario_roles = await UsuarioRol.findAll()
        return res.status(HttpCode.HTTP_OK).json(usuario_roles)
    }

    static async store(req, res) {
        const { id_usuario, id_rol } = req.body
        const user_rol = await UsuarioRol.create({
            id_usuario, 
            id_rol
        })

        return res.status(HttpCode.HTTP_CREATED).json(user_rol)
    }

    static async show(req, res) {
        const user_rol = await UsuarioRol.findOne({
            where: {
                id_usuario: req.query.id_usuario,
                id_rol: req.query.id_rol
            },                
        })

        return res.status(HttpCode.HTTP_OK).json(user_rol)
    }


    static async update(req, res) {
        const { id_usuario, id_rol } = req.query

        const user_rol_find = await UsuarioRol.findOne({
            where: {
                id_usuario,
                id_rol
            },                
        })
        if(!user_rol_find){
            return res.status(HttpCode.HTTP_UNPROCESSABLE_ENTITY).json({mjs: "No encontrado"}); 
        }
        const user_rol = await UsuarioRol.update({
            id_usuario: req.body.id_usuario,
            id_rol: req.body.id_rol
        }, {
            where: {
                id_usuario,
                id_rol
            },
            returning: ['id_usuario', 'id_rol']
        })

        return res.status(HttpCode.HTTP_OK).json(user_rol[1])
    }

    static async destroy(req, res) {
        const { id_usuario, id_rol } = req.query
        await UsuarioRol.destroy({
            where: {
                id_usuario, 
                id_rol 
            },
        })

        return res.status(HttpCode.HTTP_OK).json({
            message: 'Usuario-Rol Eliminado'
        })
    }
}

