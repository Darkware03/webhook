import {UsuarioPerfil} from "../models/index.mjs";
import HttpCode from "../../configs/httpCode.mjs";
import UnprocessableEntityException from "../../handlers/UnprocessableEntityException.mjs";


export default class UsuarioPerfilController {

    static async index(req, res) {
        const usuarios_perfil = await UsuarioPerfil.findAll()
        return res.status(HttpCode.HTTP_OK).json(usuarios_perfil)
    }

    static async store(req, res) {
        const {id_perfil, id_usuario} = req.body

        const usuario_perfil = await UsuarioPerfil.create({
            id_perfil, 
            id_usuario
        })

        return res.status(HttpCode.HTTP_CREATED).json(usuario_perfil)
    }

    static async show(req, res) {
        const { id } = req.params; 
        if(isNaN(id))
            throw new UnprocessableEntityException("UNPROCESSABLE_ENTITY", 422, "El parámetro no es un id válido");

        const usuario_perfil = await UsuarioPerfil.findOne({
            where: {
                id
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
        const { id } = req.params; 
        if(isNaN(id))
            throw new UnprocessableEntityException("UNPROCESSABLE_ENTITY", 422, "El parámetro no es un id válido");

        await UsuarioPerfil.update({
            active: false
        }, {
            where: {
                id
            },
        })

        return res.status(HttpCode.HTTP_OK).json({
            message: 'Usuario Perfil Eliminado'
        })
    }
}

