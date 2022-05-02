import dotenv from 'dotenv';

import path from 'path';

const envFile = process.env.APP_ENV ? `.env.${process.env.APP_ENV}` : '.env';
dotenv.config({
  path: path.resolve(envFile),
});
