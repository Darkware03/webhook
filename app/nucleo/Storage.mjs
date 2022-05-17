import moment from 'moment';
import path from 'path';
import fs from 'fs';
import disks from '../../configs/disk.mjs';
import File from './File.mjs';
import { uploadFile, getFile, deleteFile } from './S3Client.mjs';
import LogicalException from '../../handlers/LogicalException.mjs';
import BadRequestException from '../../handlers/BadRequestException.mjs';

export default class Storage {
  static diskObject = {};

  static disk(name) {
    Storage.diskObject = disks[name];

    return Storage;
  }

  static async put(options) {
    const {
      file, filePath, mimeTypes = [], name,
    } = options;

    if (!(file instanceof File)) {
      throw new LogicalException('ERR_INVALID_ARG_TYPE', 'El objeto no es una instancia de la clase esperada');
    }

    const mimeType = await file.getMimeType();
    if (mimeTypes.length && !mimeTypes.includes(mimeType)) {
      throw new BadRequestException('El formato del archivo no es valido');
    }

    const pathToUpload = filePath
      ? `${filePath}/${name || moment().format('x') + await file.getHashMD5()}.${await file.getExtension()}`
      : `${name || moment().format('x') + file.getHashMD5()}.${await file.getExtension()}`;

    if (!Storage.diskObject) throw new LogicalException('ERR_INVALID_DISK', 'El disco no esta definido');

    const directory = path.dirname(`./storage/${Storage.diskObject.path}/${pathToUpload}`);
    if (!fs.existsSync(directory)) {
      await fs.mkdirSync(directory, { recursive: true });
    }

    if (Storage.diskObject.type === 'local') {
      await fs.writeFileSync(`./storage/${Storage.diskObject.path}/${pathToUpload}`, file.getBuffer());
    } else if (Storage.diskObject.type === 'aws') {
      await uploadFile(Storage.diskObject.bucket, file.getBuffer(), name || moment().format('x') + file.getHashMD5());
    }

    return {
      name: pathToUpload,
      data: file.getBuffer(),
    };
  }

  static async getFile(fileName, disk) {
    if (!(typeof fileName === 'string')) throw new LogicalException('ERR_INVALID_PARAMS', 'El parametro fileName deben ser de tipo string');
    if (!(typeof disk === 'string')) throw new LogicalException('ERR_INVALID_PARAMS', 'El parametro disk deben ser de tipo string');

    const diskToRead = disks[disk];

    if (!diskToRead) throw new LogicalException('ERR_INVALID_DISK', 'El disco no esta definido');
    const pathToSearch = `${diskToRead.path}/${fileName}`;

    const diskToSearch = disks[disk];

    let buffer = {};

    if (diskToSearch.type === 'local') {
      if (!fs.existsSync(`./storage/${pathToSearch}`)) throw new LogicalException('ERR_FILE_NOT_FOUND', 'El archivo no ha sido encontrado');
      buffer = await fs.readFileSync(`./storage/${pathToSearch}`);
    } else if (diskToSearch.type === 'aws') {
      buffer = await getFile(diskToSearch.bucket, fileName);
    }

    const file = new File({
      name: fileName,
      data: buffer,
    });

    return file;
  }

  static async deleteFile(fileName, disk) {
    if (!(typeof fileName === 'string')) throw new LogicalException('ERR_INVALID_PARAMS', 'El parametro fileName deben ser de tipo string');
    if (!(typeof disk === 'string')) throw new LogicalException('ERR_INVALID_PARAMS', 'El parametro disk deben ser de tipo string');

    const diskToSearch = disks[disk];

    if (!diskToSearch) throw new LogicalException('ERR_INVALID_DISK', 'El disco no esta definido');
    const pathToSearch = `${diskToSearch.path}/${fileName}`;

    let file = {};

    if (diskToSearch.type === 'local') {
      if (!fs.existsSync(`./storage/${pathToSearch}`)) throw new LogicalException('ERR_FILE_NOT_FOUND', 'El archivo no ha sido encontrado');
      file = await fs.unlinkSync(`./storage/${pathToSearch}`);
    } else if (diskToSearch.type === 'aws') {
      file = await deleteFile(diskToSearch.bucket, fileName);
    }

    return file;
  }
}
