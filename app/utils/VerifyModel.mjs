import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';
import NotFoundExeption from '../../handlers/NotFoundExeption.mjs';
import BadRequestException from '../../handlers/BadRequestException.mjs';

export default class VerifyModel {
  static async exist(model, id, msg = 'Recurso no encontrado', options = {}) {
    const idValido = VerifyModel.isValid(id);
    const resultado = await model.findByPk(idValido, options);
    if (!resultado) {
      throw new NotFoundExeption(msg);
    }
    return resultado;
  }

  static isValid(id, message = 'Unprocessable Entity by text') {
    if (!(/^\d+$/.test(String(id)) && id > 0)) {
      throw new UnprocessableEntityException(
        message,
      );
    }
    return Number.parseInt(id, 10);
  }

  static async unique(model, arr, msg = 'Debe ser un valor unico') {
    const resultado = await model.findOne({ where: arr });
    if (resultado) {
      throw new BadRequestException(msg);
    }
    return resultado;
  }

  static async existOrCreate(model, options, data, transaction = null) {
    let resultado = await model.findOne(options);
    if (!resultado) {
      if (transaction !== null) resultado = await model.create(data, transaction);
      else resultado = await model.create(data);
    }
    return resultado;
  }

  static async arrayExist(model, arr, msg = 'id no existe', options = {}) {
    for (let index = 0; index < arr.length; index += 1) {
      // eslint-disable-next-line no-await-in-loop
      await this.exist(model, arr[index], msg, options);
    }
  }
}
