import { Router } from 'express';
import validate from '../app/middlewares/validate.mjs';
import ApiController from '../app/controllers/ApiController.mjs';
import auth from '../app/middlewares/Auth.mjs';
import bitacora from '../app/middlewares/bitacora.mjs';
import Call from '../app/utils/Call.mjs';
import routesUsers from './api/usuario.mjs';
import routesRoles from './api/rol.mjs';
import routesTipoRoles from './api/tipoRol.mjs';
import routesPerfil from './api/perfil.mjs';
import routesRutas from './api/ruta.mjs';
import recoveryPasswordSchema from '../app/schemas/RecoveryPasswordSchema.mjs';
import loginSchema from '../app/schemas/LoginSchema.mjs';
import twoFactorAuthSchema from '../app/schemas/TwoFactorAuthSchema.mjs';

const router = Router();
router.post('/v1/login', [validate(loginSchema)], Call(ApiController.login));
router.post('/v1/logout', [auth, bitacora], Call(ApiController.logout));
router.post('/v1/2fa', [validate(twoFactorAuthSchema)], Call(ApiController.twoFactorAuthLoginChoose));
router.post('/v1/2fa/verify/:id_user', Call(ApiController.verifyTwoFactorAuthCode));
router.post('/v1/2fa/code', Call(ApiController.sendCode));
router.get('/v1/verification/user/:token', Call(ApiController.confirmUser));
router.post('/v1/refresh', Call(ApiController.RefreshToken));
router.use('/v1/users', [auth, bitacora], routesUsers);
router.use('/v1/perfiles', [auth, bitacora], routesPerfil);
router.use('/v1/roles', [auth, bitacora], routesRoles);
router.use('/v1/tipo/roles', [auth, bitacora], routesTipoRoles);
router.use('/v1/rutas', [auth, bitacora], routesRutas);
router.put('/v1/recovery_password/change_password', [validate(recoveryPasswordSchema)], Call(ApiController.recoveryPassword));
router.use('/v1/recovery_password/send_email/:email', Call(ApiController.recoveryPasswordSendEmail));

export default router;
