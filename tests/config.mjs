import '../configs/Env.mjs';

const protocol = 'http://';
const host = process.env.HOST;
const port = process.env.PORT;
const url = `${protocol}${host}:${port}`;

export default url;
