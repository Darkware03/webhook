import {Router} from "express";
import routesRoles from './api/rol.mjs'
import routesPerfil from './api/perfil.mjs'
import routesRutas from './api/ruta.mjs'
import routesRutasRoles from './api/rutaRol.mjs'
import routesPerfilesRoles from './api/perfilRol.mjs'
import routesUsuariosRoles from './api/usuarioRol.mjs'
import routesUsuariosPerfiles from './api/usuarioPerfil.mjs'
import auth from "../app/middlewares/Auth.mjs";
import Call from "../app/utils/Call.mjs";



const router = Router()

router.get('/', (req, res) => {
    res.send('<h1 style="color:red">Welcome</h1>')
})

router.use('/v1/roles', [auth], Call(routesRoles))
router.use('/v1/perfiles', [auth], Call(routesPerfil))
router.use('/v1/rutas', [auth], Call(routesRutas))
router.use('/v1/rutas_roles', [auth], Call(routesRutasRoles))
router.use('/v1/perfiles_roles', [auth], Call(routesPerfilesRoles))
router.use('/v1/usuarios_roles', [auth], Call(routesUsuariosRoles))
router.use('/v1/usuarios_perfiles', [auth], Call(routesUsuariosPerfiles))


export default router