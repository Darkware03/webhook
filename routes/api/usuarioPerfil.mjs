import { validate } from 'express-jsonschema';
import { Router } from 'express';
import UsuarioPerfilController from '../../app/controllers/UsuarioPerfilController.mjs';
import usuarioPerfilCreateSchema from '../../app/schemas/UsuarioPerfilCreateSchema.mjs';
import Call from '../../app/utils/Call.mjs';

const router = Router();
router.get('/', Call(UsuarioPerfilController.index));
// router.post('/', [validate({body: usuarioCreateSchema})], Call(UsuarioPerfilController.store))
router.post('/', [validate({ body: usuarioPerfilCreateSchema })], Call(UsuarioPerfilController.store));
router.get('/:id', Call(UsuarioPerfilController.show));
router.put('/:id', [validate({ body: usuarioPerfilCreateSchema })], Call(UsuarioPerfilController.update));
router.delete('/:id', Call(UsuarioPerfilController.destroy));

export default router;
