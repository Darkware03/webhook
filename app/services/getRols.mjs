import { Perfil, Rol, Usuario } from '../models/index.mjs';

export default class getRols {
  static async roles(userId, property = 'name') {
    const user = await Usuario.findOne({ include: [Rol, { model: Perfil, include: [Rol] }], where: { id: userId } });
    const rolePerfils = user.Perfils.reduce((acumulador, value) => [...value.Rols], []);
    /**
     * Set para hacer arreglo unico sin valores repetidos
     * */
    const rols = new Set(user.Rols.concat(rolePerfils).map((row) => row[property]));
    return [...rols];
  }
}
