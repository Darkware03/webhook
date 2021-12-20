import {Router} from "express";
import routesRoles from './api/rol.mjs'
import routesPerfil from './api/perfil.mjs'
import auth from "../app/middlewares/Auth.mjs";
import Call from "../app/utils/Call.mjs";


const router = Router()

router.get('/', (req, res) => {
    res.send('<h1 style="color:red">Welcome</h1>')
})

router.use('/v1/roles', [auth], Call(routesRoles))
router.use('/v1/perfiles', [auth], Call(routesPerfil))

export default router