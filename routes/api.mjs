import { Router } from 'express';
import validate from '../app/middlewares/validate.mjs';
import ApiController from '../app/controllers/ApiController.mjs';
import auth from '../app/middlewares/Auth.mjs';
import auth2FA from '../app/middlewares/Auth2FA.mjs';
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
import SINGBOX from '../app/services/SINGBOX.mjs';
const router = Router();
router.post('/v1/login', [validate(loginSchema)], Call(ApiController.login));
router.post('/v1/logout', [auth, bitacora], Call(ApiController.logout));
router.get('/v1/2fa', [auth], Call(ApiController.twoFactorList));
router.post(
  '/v1/2fa',
  [validate(twoFactorAuthSchema)],
  Call(ApiController.twoFactorAuthLoginChoose),
);
router.post('/v1/2fa/verify', [auth2FA], Call(ApiController.verifyTwoFactorAuthCode));
router.post('/v1/2fa/code', [auth2FA], Call(ApiController.sendCode));
router.post('/v1/2fa/verification/token', Call(ApiController.sendVerificationToken));
router.get('/v1/verification/account/:token', Call(ApiController.confirmUser));
router.post('/v1/refresh', Call(ApiController.RefreshToken));
router.use('/v1/users', [auth, bitacora], routesUsers);
router.use('/v1/perfiles', [auth, bitacora], routesPerfil);
router.use('/v1/roles', [auth, bitacora], routesRoles);
router.use('/v1/tipo/roles', [auth, bitacora], routesTipoRoles);
router.use('/v1/rutas', [auth, bitacora], routesRutas);
router.put(
  '/v1/password/change',
  [validate(recoveryPasswordSchema)],
  Call(ApiController.changePassword),
);
router.post('/v1/password/reset/', Call(ApiController.resetPassword));
router.post('/v1/probar', Call(SINGBOX.singDocument));
//router.get('/v1/probar', Call(SINGBOX.singDocument));
router.get('/v1/pdf', Call(SINGBOX.obtenerDocumento));
router.post('/v1/listen/', Call(SINGBOX.listen));

export default router;
