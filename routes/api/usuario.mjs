import { Router } from 'express';
import validate from '../../app/middlewares/validate.mjs';
import UsuarioController from '../../app/controllers/UsuarioController.mjs';
import usuarioCreateSchema from '../../app/schemas/UsuarioCreateSchema.mjs';
import usuarioAddUserProfileSchema from '../../app/schemas/UsuarioAddUserProfileSchema.mjs';
import usuarioDestroyUserPerfilSchema from '../../app/schemas/UsuarioDestroyUserPerfilSchema.mjs';
import usuarioAddUserRoleSchema from '../../app/schemas/UsuarioAddUserRoleSchema.mjs';
import Call from '../../app/utils/Call.mjs';
import usuarioPasswordUpdate from '../../app/schemas/UsuarioPasswordUpdateSchema.mjs';
import usuarioUpdateEmailSchema from '../../app/schemas/UsuarioUpdateEmailSchema.mjs';

const router = Router();
router.get('/metodos-autenticacion-usuario', Call(UsuarioController.getMetodosUsuario));
router.get('/', Call(UsuarioController.index));
router.post(
  '/:id_usuario/perfiles',
  [validate(usuarioAddUserProfileSchema)],
  Call(UsuarioController.addUserProfile)
);
router.delete('/:id_usuario/perfiles', Call(UsuarioController.destroyUserPerfil));
router.post(
  '/:id_usuario/roles',
  [validate(usuarioAddUserRoleSchema)],
  Call(UsuarioController.addUserRole)
);
router.delete('/:id_usuario/roles', Call(UsuarioController.destroyUserRol));
router.put('/:id', Call(UsuarioController.update));
router.delete('/', Call(UsuarioController.destroy));
router.post('/', [validate(usuarioCreateSchema)], Call(UsuarioController.store));
router.get('/:id', Call(UsuarioController.show));
router.put(
  '/update/password',
  [validate(usuarioPasswordUpdate)],
  Call(UsuarioController.updatePassword)
);
router.put(
  '/update/email',
  [validate(usuarioUpdateEmailSchema)],
  Call(UsuarioController.updateEmail)
);
router.post('/2fa/add', Call(UsuarioController.storeMethodUser));
router.post('/2fa/add/verify', Call(UsuarioController.verifyNewMethodUser));
router.post('/2fa/method/update', Call(UsuarioController.updatePrimaryMethod));

export default router;
