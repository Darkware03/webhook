import { validate } from 'express-jsonschema';
import { Router } from 'express';
import UsuarioController from '../../app/controllers/UsuarioController.mjs';
import usuarioCreateSchema from '../../app/schemas/UsuarioCreateSchema.mjs';
import Call from '../../app/utils/Call.mjs';
import usuarioPasswordUpdate from '../../app/schemas/UsuarioPasswordUpdateSchema.mjs';

const router = Router();
router.get('/', Call(UsuarioController.index));
router.post('/:id_usuario/perfiles', Call(UsuarioController.addUserProfile));
router.delete('/:id_usuario/perfiles', Call(UsuarioController.destroyUserPerfil));
router.post('/:id_usuario/roles', Call(UsuarioController.addUserRole));
router.delete('/:id_usuario/roles', Call(UsuarioController.destroyUserRol));
router.put('/:id', Call(UsuarioController.update));
router.delete('/:id', Call(UsuarioController.destroy));
router.post('/', [validate({ body: usuarioCreateSchema })], Call(UsuarioController.store));
router.get('/:id', Call(UsuarioController.show));
router.put('/update/password', [validate({ body: usuarioPasswordUpdate })], Call(UsuarioController.updatePassword));

export default router;
