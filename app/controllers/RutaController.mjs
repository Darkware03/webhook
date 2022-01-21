import sequelize from 'sequelize';
import {
  Rol, Ruta, Usuario, Perfil,
} from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';
import Security from '../services/security.mjs';

export default class RutaController {
  static async index(req, res) {
    const rutas = await Ruta.findAll({ include: [Rol] });
    return res.status(HttpCode.HTTP_OK)
      .json(rutas);
  }

  static async store(req, res) {
    const {
      nombre,
      uri,
      nombre_uri: nombreUri,
      mostrar,
      icono,
      orden,
      publico,
      id_ruta_padre: idRutaPadre,
    } = req.body;

    const ruta = await Ruta.create({
      nombre,
      uri,
      nombreUri,
      mostrar,
      icono,
      orden,
      publico,
      idRutaPadre,
    });

    return res.status(HttpCode.HTTP_CREATED)
      .json(ruta);
  }

  static async show(req, res) {
    const { id } = req.params;

    if (Number.isNaN(id)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');

    const ruta = await Ruta.findOne({
      where: {
        id,
      },
    });

    return res.status(HttpCode.HTTP_OK)
      .json(ruta);
  }

  static async update(req, res) {
    const {
      nombre,
      uri,
      nombre_uri: nombreUri,
      mostrar,
      icono,
      orden,
      publico,
      id_ruta_padre: idRutaPadre,
    } = req.body;

    const ruta = await Ruta.update({
      nombre,
      uri,
      nombreUri,
      mostrar,
      icono,
      orden,
      publico,
      idRutaPadre,
    }, {
      where: {
        id: req.params.id,
      },
      returning: ['nombre', 'uri', 'nombre_uri', 'mostrar', 'icono', 'orden', 'publico', 'id_ruta_padre'],
    });

    return res.status(HttpCode.HTTP_OK)
      .json(ruta[1]);
  }

  static async destroy(req, res) {
    const { id } = req.params;
    if (Number.isNaN(id)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');
    await Ruta.destroy({
      where: {
        id,
      },
    });

    return res.status(HttpCode.HTTP_OK)
      .json({
        message: 'Ruta Eliminada',
      });
  }

  static async getRutas(req, res) {
    let filter = null;
    let data;
    if (req.headers.origin === process.env.FRONT_ADMIN_ADDRESS) {
      if (await Security.isGranted(req, 'SUPER-ADMIN') || await Security.isGranted(req, 'ROLE_ADMIN')) {
        filter = 'admin = true or publico = true';
      }
    }
    if (req.headers.origin === process.env.FRONT_USER_ADDRESS) {
      filter = 'admin = false or publico = true';
    }
    if (filter !== null) {
      data = await Ruta.findAll({
        include: [
          {
            model: Rol,
            attributes: [],
            include: [
              {
                model: Perfil,
                required: true,
                attributes: [],
              },
              {
                model: Usuario,
                required: true,
                attributes: [],
                where: { id: req.usuario.id },
              },
            ],
          },
        ],
        where: sequelize.literal(filter),
        order: [
          ['orden', 'ASC'],
        ],
      });
    }
    return res.status(HttpCode.HTTP_OK).send(data);
  }
}
