import {Perfil, Rol} from "../models/index.mjs";
import HttpCode from "../../configs/httpCode.mjs";
import UnprocessableEntityException from "../../handlers/UnprocessableEntityException.mjs";

export default class PerfilController {

    static async index(req, res) {
        const perfiles = await Perfil.findAll()
        return res.status(HttpCode.HTTP_OK).json(perfiles)
    }

    static async store(req, res) {
        const {id, nombre, codigo} = req.body
        let perfil;
        perfil = await Perfil.create({
            id,
            nombre,
            codigo
        })
        return res.status(HttpCode.HTTP_CREATED).json(perfil);
    }

    static async show(req, res) {
        const { id } = req.params; 
        if(isNaN(id))
            throw new UnprocessableEntityException("UNPROCESSABLE_ENTITY", 422, "El parámetro no es un id válido");
  
        const perfil = await Perfil.findOne({
            where: {
                id
            }
        })
        return res.status(HttpCode.HTTP_OK).json(perfil);
    }


    static async update(req, res) {
        const {nombre, codigo} = req.body
        const perfil = await Perfil.update({
            nombre,
            codigo
        }, {
            where: {
                id: req.params.id
            },
            returning: ['nombre', 'codigo']
        })
        return res.status(HttpCode.HTTP_OK).json(perfil[1]);
    }

    static async destroy(req, res) {
        const { id } = req.params; 
        if(isNaN(id))
            throw new UnprocessableEntityException("UNPROCESSABLE_ENTITY", 422, "El parámetro no es un id válido");

        await Perfil.destroy({
            where: {
                id
            },
        })
        return res.status(HttpCode.HTTP_OK).json({
            message: 'Perfil Eliminado'
        })
    }
}

