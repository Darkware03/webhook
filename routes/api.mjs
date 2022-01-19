import { Router } from 'express';
import validate from '../app/middlewares/validate.mjs';
import ApiController from '../app/controllers/ApiController.mjs';
import auth from '../app/middlewares/Auth.mjs';
import Call from '../app/utils/Call.mjs';
import routesUsers from './api/usuario.mjs';
import routesRoles from './api/rol.mjs';
import routesPerfil from './api/perfil.mjs';
import routesRutas from './api/ruta.mjs';
import recoveryPasswordSchema from '../app/schemas/RecoveryPasswordSchema.mjs';

const router = Router();
router.post('/v1/login', Call(ApiController.login));
router.post('/v1/2fa', Call(ApiController.twoFactorAuthLoginChoose));
router.post('/v1/2fa/check', Call(ApiController.verifyTwoFactorAuthLogin));
router.get('/v1/verificar-usuario/:token', Call(ApiController.confirmUser));
router.post('/v1/refresh', Call(ApiController.RefreshToken));
router.use('/v1/users', [auth], routesUsers);
router.use('/v1/perfiles', [auth], routesPerfil);
router.use('/v1/roles', [auth], routesRoles);
router.use('/v1/rutas', [auth], routesRutas);
router.put('/v1/recoveryPassword/changePassword', [validate(recoveryPasswordSchema)], Call(ApiController.recoveryPassword));
router.use('/v1/recoveryPassword/sendEmail/:email', Call(ApiController.recoveryPasswordSendEmail));

export default router;
