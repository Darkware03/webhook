import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import path from 'path';
import LogicalException from '../../handlers/LogicalException.mjs';

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const storage = new S3Client({
  region,
  accessKeyId,
  secretAccessKey,
});

const streamToString = (stream) => new Promise((resolve, reject) => {
  const chunks = [];
  stream.on('data', (chunk) => chunks.push(chunk));
  stream.on('error', reject);
  stream.on('end', () => {
    const buffer = Buffer.concat(chunks);
    resolve(buffer);
  });
});

const uploadFile = async (bucketName, archivo) => {
  const buffer = Buffer.from(archivo.data, 'base64');

  const ext = path.extname(archivo.name);

  const params = {
    Bucket: bucketName,
    Key: `${archivo.md5}${ext}`,
    Body: buffer,
  };

  const data = await storage.send(new PutObjectCommand(params)).catch(() => {
    throw new LogicalException(
      'FILE_NOT_SAVED',
      'No se ha podido guardar el archivo.',
    );
  });
  return data;
};

const getFile = async (bucketName, archivo) => {
  const params = {
    Bucket: bucketName,
    Key: archivo,
  };

  const data = await storage.send(new GetObjectCommand(params))
    .catch(async () => {
      params.Key = 'default.jpg';
      const defaultFoto = await storage.send(new GetObjectCommand(params));
      return defaultFoto;
    });

  const bodyContents = await streamToString(data.Body);

  return bodyContents;
};

export {
  uploadFile,
  getFile,
};
