/* eslint-disable no-underscore-dangle */
import moment from 'moment';
import path from 'path';
import fs from 'fs';
import { Readable, Stream } from 'stream';
import disks from '../../configs/disk.mjs';
import File from './File.mjs';
import {
  uploadFile, getFile, deleteFile, getFiles,
} from './S3Client.mjs';
import LogicalException from '../../handlers/LogicalException.mjs';
import BadRequestException from '../../handlers/BadRequestException.mjs';
import NotFoundExeption from '../../handlers/NotFoundExeption.mjs';
import Ftp from './Ftp.mjs';

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

    const fileName = `${name || `${moment().format('x') + await file.getHashMD5()}.${await file.getExtension()}`}`;

    const pathToUpload = filePath
      ? `${filePath}/${fileName}`
      : fileName;
    if (!Storage.diskObject) throw new LogicalException('ERR_INVALID_DISK', 'El disco no esta definido');

    const upload = {
      local: this.#uploadToLocal,
      aws: this.#uploadToAws,
      ftp: this.#uploadToFtp,
    };

    const params = {
      file,
      fileName,
      filePath,
      pathToUpload,
    };

    await upload[Storage.diskObject.type](params);

    return new File({
      name: fileName,
      path: pathToUpload,
      data: file.getBuffer(),
    });
  }

  static async getFile(fileName, disk) {
    if (!fileName) throw new NotFoundExeption('NOT_FOUND', 'El filename no puede ser nulo.');
    if (!(typeof fileName === 'string')) throw new LogicalException('ERR_INVALID_PARAMS', 'El parámetro fileName deben ser de tipo string');
    if (!(typeof disk === 'string')) throw new LogicalException('ERR_INVALID_PARAMS', 'El parámetro disk deben ser de tipo string');

    const diskToRead = disks[disk];

    if (!diskToRead) throw new LogicalException('ERR_INVALID_DISK', 'El disco no esta definido');
    const pathToSearch = `${diskToRead.path}/${fileName}`;

    const diskToSearch = disks[disk];

    let buffer = {};
    const params = {
      fileName,
      diskToSearch,
      pathToSearch,
    };

    const search = {
      local: this.#getFromLocal,
      aws: this.#getFromAws,
      ftp: this.#getFromFtp,
    };

    buffer = await search[diskToSearch.type](params);
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

    const params = {
      fileName,
      diskToSearch,
      pathToSearch,
    };

    const deleteFunction = {
      local: this.#deleteFromLocal,
      aws: this.#deleteFromAws,
      ftp: this.#deleteFromFtp,
    };
    await deleteFunction[diskToSearch.type](params);
  }

  static async getFiles(disk, filePath) {
    if (!(typeof disk === 'string')) throw new LogicalException('ERR_INVALID_PARAMS', 'El parametro disk deben ser de tipo string');

    const diskToSearch = disks[disk];

    let files;

    if (diskToSearch.type === 'local') {
      const dir = './storage/';
      files = fs.readdirSync(filePath ? `${dir}/${diskToSearch.path}/${filePath}` : `${dir}/${diskToSearch.path}`);
    } else if (diskToSearch.type === 'aws') {
      files = await getFiles(diskToSearch.bucket);
    }
    return files;
  }

  static async #uploadToLocal(params) {
    const { file, pathToUpload } = params;

    const directory = path.dirname(`./storage/${Storage.diskObject.path}/${pathToUpload}`);
    if (!fs.existsSync(directory)) {
      await fs.mkdirSync(directory, { recursive: true });
    }

    await fs.writeFileSync(`./storage/${Storage.diskObject.path}/${pathToUpload}`, file.getBuffer());
  }

  static async #uploadToAws(params) {
    const { file, fileName } = params;
    await uploadFile(Storage.diskObject.bucket, file.getBuffer(), fileName || moment().format('x') + file.getHashMD5());
  }

  static async #uploadToFtp(params) {
    const { file, fileName, filePath } = params;
    const ftpClient = Ftp.client();
    const pathFtp = `./${Storage.diskObject.path}${filePath ? `/${filePath}` : ''}`;
    await ftpClient.ensureDir(pathFtp);

    const stream = Readable.from(file.getBuffer());
    await ftpClient.upload(stream, fileName);
    await ftpClient.cd('~/');
  }

  static async #getFromLocal(params) {
    const { pathToSearch } = params;
    if (!fs.existsSync(`./storage/${pathToSearch}`)) throw new NotFoundExeption('El archivo no ha sido encontrado');
    const buffer = await fs.readFileSync(`./storage/${pathToSearch}`);
    return buffer;
  }

  static async #getFromAws(params) {
    const { fileName, diskToSearch } = params;
    const buffer = await getFile(diskToSearch.bucket, fileName);
    return buffer;
  }

  static async #getFromFtp(params) {
    const { pathToSearch } = params;
    const ftpClient = Ftp.client();
    const writableStream = new Stream.Writable();
    const chunks = [];
    writableStream._write = (chunk, _, next) => {
      chunks.push(chunk);
      next();
    };
    try {
      await ftpClient.downloadTo(writableStream, pathToSearch);
    } catch (e) {
      Ftp.handleError(e);
    }
    const buffer = Buffer.concat(chunks);
    return buffer;
  }

  static async #deleteFromLocal(params) {
    const { pathToSearch } = params;
    if (!fs.existsSync(`./storage/${pathToSearch}`)) throw new LogicalException('ERR_FILE_NOT_FOUND', 'El archivo no ha sido encontrado');
    try {
      await fs.unlinkSync(`./storage/${pathToSearch}`);
    } catch (err) {
      throw new LogicalException('ERR_FILE_NOT_DELETED', 'El archivo no ha sido eliminado');
    }
  }

  static async #deleteFromAws(params) {
    const { diskToSearch, fileName } = params;
    await deleteFile(diskToSearch.bucket, fileName);
  }

  static async #deleteFromFtp(params) {
    const { pathToSearch } = params;
    const ftpClient = Ftp.client();
    try {
      await ftpClient.remove(pathToSearch);
    } catch (e) {
      Ftp.handleError(e);
    }
  }
}
