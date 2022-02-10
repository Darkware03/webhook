import { Router } from 'express';
import validate from '../../app/middlewares/validate.mjs';
import UsuarioController from '../../app/controllers/UsuarioController.mjs';
import usuarioCreateSchema from '../../app/schemas/UsuarioCreateSchema.mjs';
import usuarioAddUserProfileSchema from '../../app/schemas/UsuarioAddUserProfileSchema.mjs';
import usuarioAddUserRoleSchema from '../../app/schemas/UsuarioAddUserRoleSchema.mjs';
import Call from '../../app/utils/Call.mjs';
import usuarioPasswordUpdate from '../../app/schemas/UsuarioPasswordUpdateSchema.mjs';
import usuarioUpdateEmailSchema from '../../app/schemas/UsuarioUpdateEmailSchema.mjs';
import validateRole from '../../app/middlewares/validateRole.mjs';

const router = Router();
router.get('/metodos-autenticacion-usuario', [validateRole('ROLE_USER_METHOD_LIST')], Call(UsuarioController.getMetodosUsuario));
router.get('/', [validateRole('ROLE_USER_VIEW')], Call(UsuarioController.index));
router.post('/:id_usuario/perfiles', [validateRole('ROLE_USER_PERFIL_CREATE'), validate(usuarioAddUserProfileSchema)], Call(UsuarioController.addUserProfile));
router.delete('/:id_usuario/perfiles', [validateRole('ROLE_USER_PERFIL_DELETE')], Call(UsuarioController.destroyUserPerfil));
router.post('/:id_usuario/roles', [validate(usuarioAddUserRoleSchema)], Call(UsuarioController.addUserRole));
router.delete('/:id_usuario/roles', [validateRole('ROLE_USER_ROL_DELETE')], Call(UsuarioController.destroyUserRol));
router.put('/:id', [validateRole('ROLE_USER_UPDATE')], Call(UsuarioController.update));
router.delete('/:id', [validateRole('ROLE_USER_DELETE')], Call(UsuarioController.destroy));
router.post('/', [validateRole('ROLE_USER_CREATE'), validate(usuarioCreateSchema)], Call(UsuarioController.store));
router.get('/:id', [validateRole('ROLE_USER_PERFIL_VIEW')], Call(UsuarioController.show));
router.put('/update/password', [validateRole('ROLE_USER_PASSWORD_UPDATE'), validate(usuarioPasswordUpdate)], Call(UsuarioController.updatePassword));
router.put('/update/email', [validateRole('ROLE_USER_EMAIL_DELETE'), validate(usuarioUpdateEmailSchema)], Call(UsuarioController.updateEmail));
router.post('/2fa/add', Call(UsuarioController.storeMethodUser));
router.post('/2fa/add/verify', Call(UsuarioController.verifyNewMethodUser));
router.post('/2fa/method/update', Call(UsuarioController.updatePrimaryMethod));

export default router;
