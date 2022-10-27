import ftp from 'basic-ftp';
import ftpConfig from '../../configs/ftp.mjs';
import NotFoundExeption from '../../handlers/NotFoundExeption.mjs';

export default class Ftp {
  static ftpClient;

  static init() {
    this.#connect();
  }

  static async #connect() {
    Ftp.ftpClient = new ftp.Client();
    Ftp.ftpClient.ftp.verbose = process.env.FTP_DEBUG === 'true';
    try {
      await Ftp.ftpClient.access(ftpConfig);
    } catch {
      // eslint-disable-next-line no-console
      console.error('No se ha podido establecer conexión con el servidor ftp');
    }
  }

  static client() {
    return Ftp.ftpClient;
  }

  static handleError(err) {
    const error = {
      550: new NotFoundExeption('No se ha encontrado el archivo'),
    };
    throw error[err.code];
  }
}
