import moment from 'moment';
import disks from '../../configs/disk.mjs';
import File from './File.mjs';
import { uploadFile } from './S3Client.mjs';

export default class Storage {
  disk(diskName) {
    this.disk = diskName;
  }

  setExtension(extensions) {
    this.extensions = extensions;
  }

  async put(file, path) {
    if (!(file instanceof File)) {
      throw new Error('ERR_INVALID_ARG_TYPE', 'El objeto no es una instancia de la clase esperada.');
    }

    const fileToUpload = file.getFile();

    const diskToUpload = disks[this.disk];
    const pathToUpload = path ? `${diskToUpload.path}/${path}` : diskToUpload.path;

    if (!diskToUpload) throw new Error('ERR_INVALID_DISK', 'El disco no esta definido');

    if (diskToUpload.type === 'local') {
      fileToUpload.mv(`${pathToUpload}/${moment().format('YYYYMMDDHHmmss')}${fileToUpload.name}`);
    } else if (diskToUpload.type === 'aws') {
      await uploadFile(diskToUpload.bucket, fileToUpload);
    }

    return fileToUpload;
  }
}
