import { Router } from 'express';
import { validate } from 'express-jsonschema';
import ApiController from '../app/controllers/ApiController.mjs';
import auth from '../app/middlewares/Auth.mjs';
import loginSchema from '../app/schemas/LoginSchema.mjs';
import Call from '../app/utils/Call.mjs';
import routesUsers from './api/usuario.mjs';
import routesRoles from './api/rol.mjs';
import routesPerfil from './api/perfil.mjs';
import routesRutas from './api/ruta.mjs';

const router = Router();
router.post('/v1/login', [validate({ body: loginSchema })], Call(ApiController.login));
router.post('/v1/refresh', Call(ApiController.RefreshToken));
router.use('/v1/users', [auth], routesUsers);
router.use('/v1/perfiles', [auth], routesPerfil);
router.use('/v1/roles', [auth], routesRoles);
router.use('/v1/rutas', [auth], routesRutas);
export default router;
