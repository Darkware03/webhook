import {Router} from "express";
import routesRoles from './api/rol.mjs';
import routesPerfil from './api/perfil.mjs';
import routesRutas from './api/ruta.mjs';
import routesRutasRoles from './api/rutaRol.mjs';
import routesPerfilesRoles from './api/perfilRol.mjs';
import routesUsuariosRoles from './api/usuarioRol.mjs';
import routesUsuariosPerfiles from './api/usuarioPerfil.mjs';
import auth from "../app/middlewares/Auth.mjs";



const router = Router()

router.get('/', (req, res) => {
    res.send('<h1 style="color:red">Welcome</h1>')
})

router.use('/v1/perfiles', [auth], routesPerfil)
router.use('/v1/roles', [auth], routesRoles)
router.use('/v1/rutas', [auth], routesRutas)
router.use('/v1/rutas_roles', [auth], routesRutasRoles)
router.use('/v1/perfiles_roles', [auth], routesPerfilesRoles)
router.use('/v1/usuarios_roles', [auth], routesUsuariosRoles)
router.use('/v1/usuarios_perfiles', [auth], routesUsuariosPerfiles)


export default router