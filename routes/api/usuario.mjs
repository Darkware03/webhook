import { Router } from 'express';
import validate from '../../app/middlewares/validate.mjs';
import UsuarioController from '../../app/controllers/UsuarioController.mjs';
import usuarioCreateSchema from '../../app/schemas/UsuarioCreateSchema.mjs';
import usuarioAddUserProfileSchema from '../../app/schemas/UsuarioAddUserProfileSchema.mjs';
import usuarioDestroyUserPerfilSchema from '../../app/schemas/UsuarioDestroyUserPerfilSchema.mjs';
import usuarioAddUserRoleSchema from '../../app/schemas/UsuarioAddUserRoleSchema.mjs';
import usuarioDestroyUserRolSchema from '../../app/schemas/UsuarioDestroyUserRolSchema.mjs';
import Call from '../../app/utils/Call.mjs';

const router = Router();
router.get('/', Call(UsuarioController.index));
router.post('/:id_usuario/perfiles', [validate(usuarioAddUserProfileSchema)], Call(UsuarioController.addUserProfile));
router.delete('/:id_usuario/perfiles', [validate(usuarioDestroyUserPerfilSchema)], Call(UsuarioController.destroyUserPerfil));
router.post('/:id_usuario/roles', [validate(usuarioAddUserRoleSchema)], Call(UsuarioController.addUserRole));
router.delete('/:id_usuario/roles', [validate(usuarioDestroyUserRolSchema)], Call(UsuarioController.destroyUserRol));
router.put('/:id', Call(UsuarioController.update));
router.delete('/:id', Call(UsuarioController.destroy));
router.post('/', [validate(usuarioCreateSchema)], Call(UsuarioController.store));
router.get('/:id', Call(UsuarioController.show));

export default router;
