import {Router} from "express";
import ApiController from "../app/controllers/ApiController.mjs";
import auth from "../app/middlewares/Auth.mjs";
import {validate} from "express-jsonschema";
import {loginSchema} from "../app/schemas/LoginSchema.mjs";
import Call from "../app/utils/Call.mjs";
import routesUsers from './api/usuario.mjs'
import routesRoles from './api/rol.mjs';
import routesPerfil from './api/perfil.mjs';
import routesRutas from './api/ruta.mjs';
import routesRutasRoles from './api/rutaRol.mjs';
import routesPerfilesRoles from './api/perfilRol.mjs';
import routesUsuariosRoles from './api/usuarioRol.mjs';
import routesUsuariosPerfiles from './api/usuarioPerfil.mjs';



const router = Router()
router.post('/v1/login', [validate({body: loginSchema})], Call(ApiController.login))
router.post('/v1/refresh',  Call(ApiController.RefreshToken))
router.use('/v1/users', [auth], routesUsers)
router.use('/v1/perfiles', [auth], routesPerfil)
router.use('/v1/roles', [auth], routesRoles)
router.use('/v1/rutas', [auth], routesRutas)
router.use('/v1/rutas_roles', [auth], routesRutasRoles)
router.use('/v1/perfiles_roles', [auth], routesPerfilesRoles)
router.use('/v1/usuarios_roles', [auth], routesUsuariosRoles)
router.use('/v1/usuarios_perfiles', [auth], routesUsuariosPerfiles)


export default router