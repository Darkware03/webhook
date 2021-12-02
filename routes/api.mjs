import Prefix from "../app/middlewares/Prefix.mjs";
import {usuario} from './api/usuario.mjs'
import {auth} from "./api/auth.mjs";
import Auth from "../app/middlewares/Auth.mjs";

const initRoute = () => {
    //creamos el prefix api
    const api = new Prefix('/api', [Auth])

    auth(api)

    //llamamos a las rutas de usuario
    usuario(api)


    //decimos que las rutas que no encuentre nos respona el not found
    api.route.notFound('*')
    //genera todas las rutas de api
    api.generate()
}


export default initRoute