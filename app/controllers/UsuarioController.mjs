import Usuario from "../models/Usuario.mjs";
import HttpCode from "../../configs/httpCode.mjs";

export default class UsuarioController {

    static async index(req, res, next) {
        const usuarios = await Usuario.findAll()
        return res.status(HttpCode.HTTP_OK).json(usuarios)
    }

    static async store(req, res, next) {
        const {first_name, last_name} = req.body
        const usuario = await Usuario.create({
            first_name, last_name
        })
        return res.status(HttpCode.HTTP_CREATED).json(usuario)
    }

    static async show(req, res, next){
        const usuario=await Usuario.findOne({id:req.params.id})

        return res.status(HttpCode.HTTP_OK).json(usuario)
    }
}

