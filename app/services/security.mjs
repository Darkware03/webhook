import speakeasy from 'speakeasy';
import getRols from './getRols.mjs';

export default class Security {
  static async isGranted(idUser, role) {
    const allRols = await getRols.roles(idUser);

    const havePermision = await allRols.some((rol) => rol === role);

    return havePermision;
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

  static async verifyTwoFactorAuthCode(params) {
    const {
      code,
      secretKey,
      time,
      step,
    } = params;
    const toVerify = {
      secret: secretKey,
      encoding: 'base32',
      token: code,
    };

    if (time) {
      toVerify.window = Number(time);
      toVerify.step = step || 10;
    }
    return speakeasy.totp.verify(toVerify);
  }
}
