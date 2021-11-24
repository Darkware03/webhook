import './configs/Env.mjs'
import Server from './configs/server.mjs'

const app = new Server();
console.log('here',process.env.DB_HOST)

app.start(); 