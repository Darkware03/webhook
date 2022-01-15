import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
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

  static async generateTwoFactorAuthCode(email) {
    const secretKey = await speakeasy.generateSecret({
      name: `${process.env.SISTEM_NAME} ${email}`,
      issuer: process.env.SISTEM_NAME,
    });
    return {
      secret_code: secretKey.base32,
      qrCode: secretKey.otpauth_url,
    };
  }

  static async verifyTwoFactorAuthCode(code, secretKey, time = null) {
    return speakeasy.totp.verify({
      secret: secretKey,
      encoding: 'base32',
      token: code,
      window: 1,
      time,
    });
  }
}
