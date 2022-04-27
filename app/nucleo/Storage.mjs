import moment from 'moment';
import fs from 'fs';
import disks from '../../configs/disk.mjs';
import File from './File.mjs';
import { uploadFile, getFile } from './S3Client.mjs';
import LogicalException from '../../handlers/LogicalException.mjs';

export default class Storage {
  static diskObject = {};

  static mimeTypes = [];

  static disk(name) {
    Storage.diskObject = disks[name];

    return Storage;
  }

  static fileTypes(mimeTypes) {
    if (!Array.isArray(mimeTypes)) throw new LogicalException('ERR_INVALID_ARG_TYPE', 'El parametro recibido debe ser un arreglo');
    Storage.mimeTypes = mimeTypes;

    return Storage;
  }

  static validate(file) {
    const mimeType = file.mimetype;
    if (!Storage.mimeTypes.length) throw new LogicalException('ERR_INVALID_MIMETYPES', 'No se ha definido un arreglo de tipo de archivos');
    return Storage.mimeTypes.includes(mimeType);
  }

  static async put(file, path) {
    if (!(file instanceof File)) {
      throw new LogicalException('ERR_INVALID_ARG_TYPE', 'El objeto no es una instancia de la clase esperada');
    }

    const fileToUpload = file.getFile();

    const pathToUpload = path ? `${Storage.diskObject.path}/${path}` : Storage.diskObject.path;

    if (!Storage.diskObject) throw new LogicalException('ERR_INVALID_DISK', 'El disco no esta definido');

    if (Storage.diskObject.type === 'local') {
      fileToUpload.mv(`./storage/${pathToUpload}/${moment().format('x')}${fileToUpload.md5}${file.getExtension()}`);
    } else if (Storage.diskObject.type === 'aws') {
      await uploadFile(Storage.diskObject.bucket, fileToUpload);
    }

    return fileToUpload;
  }

  static async getFile(fileName, disk) {
    if (!(typeof fileName === 'string')) throw new LogicalException('ERR_INVALID_PARAMS', 'El parametro fileName deben ser de tipo string');
    if (!(typeof disk === 'string')) throw new LogicalException('ERR_INVALID_PARAMS', 'El parametro disk deben ser de tipo string');

    const diskToRead = disks[disk];

    if (!diskToRead) throw new LogicalException('ERR_INVALID_DISK', 'El disco no esta definido');
    const pathToSearch = `${diskToRead.path}/${fileName}`;

    const diskToSearch = disks[disk];

    let file = {};

    if (diskToSearch.type === 'local') {
      if (!fs.existsSync(`./storage/${pathToSearch}`)) throw new LogicalException('ERR_FILE_NOT_FOUND', 'El archivo no ha sido encontrado');
      file = await fs.readFileSync(`./storage/${pathToSearch}`);
    } else if (diskToSearch.type === 'aws') {
      file = await getFile(diskToSearch.bucket, fileName);
    }

    return file;
  }
}
