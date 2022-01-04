import {Ruta, RutaRol, Rol} from "../models/index.mjs";
import HttpCode from "../../configs/httpCode.mjs";
import DB from "../nucleo/DB.mjs";

export default class RutaController {

    static async index(req, res) {
        const rutas = await Ruta.findAll()
        return res.status(HttpCode.HTTP_OK).json(rutas)
    }

    static async store(req, res) {
        const connection = DB.connection();
        const t = await connection.transaction();
        let arrRoles = [];
        const { nombre, uri, nombre_uri, mostrar, icono, orden, publico, id_ruta_padre, roles } = req.body

        try {
            const ruta = await Ruta.create({
                nombre, 
                uri, 
                nombre_uri, 
                mostrar, 
                icono, 
                orden, 
                publico, 
                id_ruta_padre
            }, { transaction: t }); 

            if (roles.length > 0) {
                for (let index = 0; index < roles.length; index++) {
                  let exist = await Rol.findOne({
                    where: {
                      id: roles[index],
                    },
                  });
                  if (exist) {
                    await RutaRol.create(
                      {
                        id_rol: roles[index],
                        id_ruta: ruta.id,
                      },
                      { transaction: t }
                    );
                    let { id, name: nombre } = exist;
                    arrRoles.push({ id, nombre });
                  } else {
                    return res
                      .status(422)
                      .json({ message: `Id Rol ${roles[index]} no encontrado` });
                  }
                }
              }
              await t.commit();
              return res.status(HttpCode.HTTP_CREATED).json({
                  id,
                  nombre, 
                  uri, 
                  nombre_uri, 
                  publico, 
                  mostrar,
                  roles: arrRoles,
                });
                
            } catch (error) {
            console.log(error);
            await t.rollback();
            return res.status(500).json({ message: error });
        }

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

