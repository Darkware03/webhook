import {PerfilRol} from "../models/index.mjs";
import HttpCode from "../../configs/httpCode.mjs";
import UnprocessableEntityException from "../../handlers/UnprocessableEntityException.mjs";


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

        return res.status(HttpCode.HTTP_CREATED).json(perfil_rol);
    }

    static async show(req, res) {
        const { id } = req.params; 
        if(isNaN(id))
            throw new UnprocessableEntityException("UNPROCESSABLE_ENTITY", 422, "El parámetro no es un id válido");
        
            const perfil_rol = await PerfilRol.findOne({
            where: {
                id
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
        const { id } = req.params; 
        if(isNaN(id))
            throw new UnprocessableEntityException("UNPROCESSABLE_ENTITY", 422, "El parámetro no es un id válido");

        await PerfilRol.destroy({
            where: {
                id
            },
        })
        return res.status(HttpCode.HTTP_OK).json({
            message: 'Perfil Rol Eliminado'
        })
    }
}

