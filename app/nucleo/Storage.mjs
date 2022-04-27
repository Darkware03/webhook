import moment from 'moment';
import fs from 'fs';
import disks from '../../configs/disk.mjs';
import File from './File.mjs';
import { uploadFile, getFile } from './S3Client.mjs';

export default class Storage {
  static diskName = '';

  static mimeTypes = [];

  static disk(name) {
    Storage.diskName = name;

    return Storage;
  }

  static fileTypes(mimeTypes) {
    if (!Array.isArray(mimeTypes)) throw new Error('ERR_INVALID_ARG_TYPE: Arreglo esperado');
    Storage.mimeTypes = mimeTypes;

    return Storage;
  }

  static validate(file) {
    const mimeType = file.mimetype;
    if (!Storage.mimeTypes.length) throw new Error('ERR_INVALID_MIMETYPES: No se ha definido un arreglo de tipo de archivos');
    return Storage.mimeTypes.includes(mimeType);
  }

  static async put(file, path) {
    if (!(file instanceof File)) {
      throw new Error('ERR_INVALID_ARG_TYPE: El objeto no es una instancia de la clase esperada');
    }

    const fileToUpload = file.getFile();

    const diskToUpload = disks[Storage.diskName];
    const pathToUpload = path ? `${diskToUpload.path}/${path}` : diskToUpload.path;

    if (!diskToUpload) throw new Error('ERR_INVALID_DISK: El disco no esta definido');

    if (diskToUpload.type === 'local') {
      fileToUpload.mv(`./storage/${pathToUpload}/${moment().format('x')}${fileToUpload.md5}${file.getExtension()}`);
    } else if (diskToUpload.type === 'aws') {
      await uploadFile(diskToUpload.bucket, fileToUpload);
    }

    return fileToUpload;
  }

  static async getFile(fileName, disk) {
    if (!(typeof fileName === 'string')) throw new Error('ERR_INVALID_PARAMS: El parametro fileName deben ser de tipo string');
    if (!(typeof disk === 'string')) throw new Error('ERR_INVALID_PARAMS: El parametro disk deben ser de tipo string');

    const diskToRead = disks[disk];
    const pathToSearch = `${diskToRead.path}/${fileName}`;

    const diskToSearch = disks[disk];

    let file = {};

    if (diskToSearch.type === 'local') {
      if (!fs.existsSync(`./storage/${pathToSearch}`)) throw new Error('ERR_FILE_NOT_FOUND: El archivo no ha sido encontrado');
      file = await fs.readFileSync(`./storage/${pathToSearch}`);
    } else if (diskToSearch.type === 'aws') {
      file = await getFile(diskToSearch.bucket, fileName);
    }

    return file;
  }
}
