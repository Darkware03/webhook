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

  static async verifyTwoFactorAuthCode(code, secretKey, time = null, step = 10) {
    return speakeasy.totp.verify({
      secret: secretKey,
      encoding: 'base32',
      token: code,
      window: Number(time),
      step,
    });
  }
}
