import { Perfil, Rol, Usuario } from '../models/index.mjs';

export default class getRols {
  static async roles(userId) {
    const user = await Usuario.findOne({ include: [Rol, { model: Perfil, include: [Rol] }], where: { id: userId } });
    const rolePerfils = user.Perfils.reduce((acumulato, value) => [...value.Rols], []);
    const rols = new Set(user.Rols.concat(rolePerfils).map((row) => row.name));
    const allRols = [...rols];
    return allRols;
  }
}
