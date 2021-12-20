import Ruta from "../models/Ruta";
import HttpCode from "../../configs/httpCode.mjs";
import WS from '../services/WS.mjs'

export default class RutaController {

    static async index(req, res) {
        const rutas = await Ruta.findAll()
        return res.status(HttpCode.HTTP_OK).json(rutas)
    }

    static async store(req, res) {
        const { nombre, uri, nombre_uri, mostrar, icono, orden, publico, id_ruta_padre } = req.body

        const ruta = await Ruta.create({
            nombre, 
            uri, 
            nombre_uri, 
            mostrar, 
            icono, 
            orden, 
            publico, 
            id_ruta_padre
        })

        WS.emit("new_ruta", ruta)

        return res.status(HttpCode.HTTP_CREATED).json(ruta)
    }

    static async show(req, res) {
        const ruta = await Ruta.findOne({
            where: {
                id: req.params.id
            }
        })

        return res.status(HttpCode.HTTP_OK).json(ruta)
    }


    static async update(req, res) {
        const { nombre, uri, nombre_uri, mostrar, icono, orden, publico, id_ruta_padre } = req.body

        const ruta = await Ruta.update({
            nombre, 
            uri, 
            nombre_uri, 
            mostrar, 
            icono, 
            orden, 
            publico, 
            id_ruta_padre
        }, {
            where: {
                id: req.params.id
            },
            returning: ['nombre', 'uri', 'nombre_uri', 'mostrar', 'icono', 'orden', 'publico', 'id_ruta_padre']
        })

        return res.status(HttpCode.HTTP_OK).json(ruta[1])
    }

    static async destroy(req, res) {
        await Ruta.destroy({
            where: {
                id: req.params.id
            },
        })

        return res.status(HttpCode.HTTP_OK).json({
            message: 'Ruta Eliminada'
        })
    }
}

