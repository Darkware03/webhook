import jwt from 'jsonwebtoken';
import getRols from './getRols.mjs';

export default class Security {
  // eslint-disable-next-line consistent-return
  static async isGranted(req, receivedRol) {
    let { authorization } = req.headers;
    authorization = authorization.split(' ');
    if (!authorization.length < 2) {
      const token = authorization[1];
      const { id } = jwt.verify(token, process.env.SECRET_KEY);
      const allRols = await getRols.roles(id);
      const havePermision = await allRols.find((rol) => rol === receivedRol);
      if (havePermision) return true;
      return false;
    }
  }
}
