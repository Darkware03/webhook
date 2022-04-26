import env from 'dotenv';

env.config();

const appEnv = process.env.APP_ENV;

// eslint-disable-next-line import/no-mutable-exports
let url = '';

const protocol = 'http://';
const host = process.env.HOST;
const port = process.env.PORT;

if (appEnv === 'development') {
  url = `${protocol}${host}:${port}`;
} else if (appEnv === 'production') {
  url = `${protocol}+${host}`;
}

export default url;
