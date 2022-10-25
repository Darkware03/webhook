import { fileTypeFromBuffer } from 'file-type';
import crypto from 'crypto';
import LogicalException from '../../handlers/LogicalException.mjs';

export default class File {
  #name;

  #data;

  #path;

  constructor(file) {
    if (!Buffer.isBuffer(file.data)) {
      throw new LogicalException('ERR_INVALID_FILE', 'No se puede cargar este objeto como archivo');
    }

    const {
      name, data, path = null,
    } = file;

    this.#name = name;
    this.#data = data;
    this.#path = path;
  }

  async getExtension() {
    const { ext } = await fileTypeFromBuffer(this.#data);
    return ext;
  }

  getName() {
    return this.#name;
  }

  getSize(medida) {
    const size = Buffer.byteLength(this.#data);
    let conversion = 1;
    if (medida === 'KB')conversion = 1024;
    else if (medida === 'MB') conversion = 1048576;

    if (size === 0) {
      throw new LogicalException('ERR_INVALID_FILE_SIZE', 'No es posible obtener el tamaño del archivo');
    }

    return (size / conversion).toFixed(1);
  }

  async getMimeType() {
    const { mime } = await fileTypeFromBuffer(this.#data);
    return mime;
  }

  getStringBuffer() {
    const buffer = this.#data;
    const base64 = Buffer.from(buffer).toString('base64');
    return base64;
  }

  getBuffer() {
    return this.#data;
  }

  getHashMD5() {
    const md5 = crypto.createHash('md5').update(this.#name).digest('hex');
    return md5;
  }

  getPath() {
    return this.#path;
  }
}
