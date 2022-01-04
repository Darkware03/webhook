import {UsuarioPerfil} from "../models/index.mjs";
import HttpCode from "../../configs/httpCode.mjs";
import bcrypt from 'bcryptjs'

export default class UsuarioPerfilController {

    static async index(req, res) {
        const usuarios_perfil = await UsuarioPerfil.findAll()
        return res.status(HttpCode.HTTP_OK).json(usuarios_perfil)
    }

    static async store(req, res) {
        const {id_perfil, id_usuario} = req.body
        const salt = bcrypt.genSaltSync()

        const usuario_perfil = await UsuarioPerfil.create({
            id_perfil, 
            id_usuario
        })


        return res.status(HttpCode.HTTP_CREATED).json(usuario_perfil)
    }

    static async show(req, res) {
        const usuario_perfil = await UsuarioPerfil.findOne({
            where: {
                id: req.params.id
            }
        })

        return res.status(HttpCode.HTTP_OK).json(usuario_perfil); 
    }


    static async update(req, res) {
        const {id_perfil, id_usuario} = req.body
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
    }

    static async destroy(req, res) {
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
    }
}

