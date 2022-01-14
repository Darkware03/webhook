/* eslint-disable no-unused-vars */
import bcrypt from 'bcryptjs';
import Sequelize from 'sequelize';
import moment from 'moment-timezone';
import HttpCode from '../../configs/httpCode.mjs';
import DB from '../nucleo/DB.mjs';
import BadRequestException from '../../handlers/BadRequestException.mjs';
import NotFoundException from '../../handlers/NotFoundExeption.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';
import Mailer from '../services/mailer.mjs';

import {
  Usuario,
  UsuarioRol,
  UsuarioPerfil,
  Perfil,
  Rol,
} from '../models/index.mjs';

export default class UsuarioController {
  static async index(req, res) {
    const usuarios = await Usuario.findAll({});
    return res.status(HttpCode.HTTP_OK).json(usuarios);
  }

  static async store(req, res) {
    const connection = DB.connection();
    const t = await connection.transaction();
    const {
      perfiles, roles, email, password,
    } = req.body;
    const salt = bcrypt.genSaltSync();
    const passwordCrypt = bcrypt.hashSync(password, salt);

    try {
      if (perfiles) {
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < perfiles.length; index++) {
          // eslint-disable-next-line no-await-in-loop
          const perfil = await Perfil.findOne({ where: { id: perfiles[index] } });
          if (!perfil) throw new NotFoundException('NOT_FOUND', 404, `No se encontró el perfil con id ${perfiles[index]}`);
        }
      }
      if (roles) {
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < roles.length; index++) {
          // eslint-disable-next-line no-await-in-loop
          const rol = await Rol.findOne({ where: { id: roles[index] } });
          if (!rol) throw new NotFoundException('NOT_FOUND', 404, `No se encontró el rol con id ${roles[index]}`);
        }
      }

      const usuario = await Usuario.create(
        { email, password: passwordCrypt },
        { transaction: t },
      );

      await usuario.addPerfils(perfiles, { transaction: t });
      await usuario.addRols(roles, { transaction: t });
      const idUsuario = usuario.id;
      await t.commit();

      const us = await Usuario.getById(idUsuario);
      const { Perfils, Rols } = us.dataValues;

      return res.status(HttpCode.HTTP_CREATED).json({
        id: usuario.id,
        email: usuario.email,
        perfiles: Perfils,
        roles: Rols,
      });
    } catch (e) {
      await t.rollback();
      throw e;
    }
  }

  static async update(req, res) {
    const { email } = req.body;
    const usuario = await Usuario.update(
      {
        email,
      },
      {
        where: {
          id: req.params.id,
        },
        returning: ['id', 'email'],
      },
    );
    return res.status(HttpCode.HTTP_OK).json(usuario[1]);
  }

  static async destroy(req, res) {
    const { id } = req.params;

    if (Number.isNaN(id)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');

    await Usuario.update(
      {
        active: false,
      },
      {
        where: {
          id,
        },
      },
    );

    return res.status(HttpCode.HTTP_OK).json({
      message: 'Usuario Eliminado',
    });
  }

  static async show(req, res) {
    const { id } = req.params;
    if (Number.isNaN(id)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parámetro no es un id válido');

    const user = await Usuario.getById(id);

    if (!user) {
      throw new NotFoundException();
    }
    const { Perfils: perfiles, Rols: roles, ...usuario } = user.dataValues;
    res.status(HttpCode.HTTP_OK).json({ ...usuario, perfiles, roles });
  }

  static async addUserProfile(req, res) {
    const { id_usuario: idUsuario } = req.params;
    if (Number.isNaN(idUsuario)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parametro no es un id válido');

    const { perfiles } = req.body;

    if (perfiles.length === 0) {
      throw new BadRequestException(
        'BAD_REQUEST',
        400,
        'No se envío ningún perfil',
      );
    }
    const user = await Usuario.findOne({ where: { id: idUsuario } });
    const userProfils = await user.addPerfils(perfiles);

    return res.status(HttpCode.HTTP_CREATED).json({
      user,
      userProfils,
    });
  }

  static async addUserRole(req, res) {
    const { id_usuario: idUsuario } = req.params;
    const { roles } = req.body;

    if (Number.isNaN(idUsuario)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parametro no es un id válido');

    if (roles.length === 0) {
      throw new BadRequestException(
        'BAD_REQUEST',
        400,
        'No se envío ningún rol',
      );
    }
    const user = await Usuario.findOne({ where: { id: idUsuario } });
    const userRols = await user.addRols(roles);

    return res.status(HttpCode.HTTP_CREATED).json({
      user_rols: userRols,
    });
  }

  static async destroyUserPerfil(req, res) {
    const { id_usuario: idUsuario } = req.params;
    const { perfiles } = req.body;

    if (Number.isNaN(idUsuario)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parametro no es un id válido');

    if (perfiles.length && perfiles.length <= 0) {
      throw new BadRequestException(
        'BAD_REQUEST',
        400,
        'No se envío ningún perfil',
      );
    }
    await UsuarioPerfil.destroy({
      where: {
        id_usuario: idUsuario,
        id_perfil: {
          [Sequelize.Op.in]: perfiles,
        },
      },
    });
    return res
      .status(HttpCode.HTTP_OK)
      .json({ message: 'Perfiles eliminados' });
  }

  static async destroyUserRol(req, res) {
    const { id_usuario: idUsuario } = req.params;
    const { roles } = req.body;

    if (Number.isNaN(idUsuario)) throw new UnprocessableEntityException('UNPROCESSABLE_ENTITY', 422, 'El parametro no es un id válido');

    if (roles.length && roles.length <= 0) {
      throw new BadRequestException(
        'BAD_REQUEST',
        400,
        'No se envío ningún rol',
      );
    }
    await UsuarioRol.destroy({
      where: {
        id_usuario: idUsuario,
        id_rol: {
          [Sequelize.Op.in]: roles,
        },
      },
    });
    return res.status(HttpCode.HTTP_OK).json({ message: 'roles eliminados' });
  }

  static async updatePassword(req, res) {
    // eslint-disable-next-line camelcase
    const { password_actual, password, confirm_password } = req.body;
    if (!bcrypt.compareSync(password_actual, req.usuario.password)) { throw new NotFoundException('BAD_REQUEST', HttpCode.HTTP_BAD_REQUEST, 'La contraseña proporcionada no es correcta'); }
    // eslint-disable-next-line camelcase
    if (password_actual === password) { throw new NotFoundException('BAD_REQUEST', HttpCode.HTTP_BAD_REQUEST, 'La nueva contraseña no puede ser igual que la anterior'); }
    // eslint-disable-next-line camelcase
    if (password !== confirm_password) { throw new NotFoundException('BAD_REQUEST', HttpCode.HTTP_BAD_REQUEST, 'Las contraseñas no coinciden'); }

    const salt = bcrypt.genSaltSync();
    const passwordCrypt = bcrypt.hashSync(password, salt);

    await Usuario.update({
      password: passwordCrypt,
      token_valid_after: moment().tz('America/El_Salvador').format(),
    }, {
      where: {
        id: req.usuario.id,
      },
      returning: ['id', 'email'],
    });
    const msg = 'Se le comunica que su contraseña ha sido modificada exitosamente';

    await Mailer.sendMail(req.usuario.email, msg, 'Cambio de contraseña', 'Contraseña modificada');
    return res.status(HttpCode.HTTP_OK).json({ message: 'Contraseña actualizada con exito' });
  }

  static async updateEmail(req, res) {
    const { email } = req.body;

    await Usuario.update(
      {
        email,
        token_valid_after: moment().tz('America/El_Salvador').format(),
      },
      {
        where: {
          id: req.usuario.id,
        },
        returning: ['id', 'email'],
      },
    );
    // Envio de notificacion por correo electronico
    const menssage = `
          <mj-section border-left="1px solid #aaaaaa" border-right="1px solid #aaaaaa" padding="20px" border-bottom="1px solid #aaaaaa">
            <mj-column>
              <mj-table>
                <tr>
                  <mj-text align="center">
                    <td style="padding: 0 15px;" align="center" font-weight="bold" font-size="17px">
                      <mj-group>
                        <mj-text >
                          Estimado usuario se le comunica que el correo: <mj-text font-style="oblique"> ${req.usuario.email} </mj-text>
                        </mj-text>
                        <mj-text>
                          ha sido cambiado satisfactoriamente. 
                        </mj-text> 
                        <mj-text>
                          Desde este momento este correo manejará la cuenta en donde solicito el cambio
                        </mj-text>
                      </mj-group>
                    </td>
                  </mj-text>
                </tr>
              </mj-table>
            </mj-column>
          </mj-section>
        `;
    await Mailer.sendMail(email, menssage, 'Cambio de email', 'Confirmacion de cambio de correo electronico');

    return res.status(HttpCode.HTTP_OK).json({ message: 'Correo electronico actualizado con exito' });
  }
}
