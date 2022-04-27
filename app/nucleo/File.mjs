import path from 'path';
import LogicalException from '../../handlers/LogicalException.mjs';

export default class File {
  #file;

  constructor(file) {
    if (!Buffer.isBuffer(file.data)) {
      throw new LogicalException('ERR_INVALID_FILE', 'No se puede cargar este objeto como archivo');
    }

    this.#file = file;
  }

  getExtension() {
    const ext = path.extname(this.#file.name);
    return ext;
  }

  getSize(medida) {
    const { size } = this.#file;
    let conversion = 1;
    if (medida === 'KB')conversion = 1024;
    else if (medida === 'MB') conversion = 1048576;

    if (size === 0) {
      throw new LogicalException('ERR_INVALID_FILE_SIZE', 'No es posible obtener el tamaño del archivo');
    }
    return (size / (conversion)).toFixed(1);
  }

  getStringBuffer() {
    const { data: buffer } = this.#file;
    const base64 = Buffer.from(buffer).toString('base64');
    return base64;
  }

  getHashMD5() {
    const { md5 } = this.#file;
    return md5;
  }

  getFile() {
    return this.#file;
  }
}
