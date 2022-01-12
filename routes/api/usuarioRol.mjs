import { validate } from 'express-jsonschema';
import { Router } from 'express';
import UsuarioRolController from '../../app/controllers/UsuarioRolController.mjs';
import usuarioRolCreateSchema from '../../app/schemas/UsuarioRolCreateSchema.mjs';
import Call from '../../app/utils/Call.mjs';

const router = Router();
router.get('/', Call(UsuarioRolController.index));
// router.post('/', [validate({body: usuarioCreateSchema})], Call(UsuarioRolController.store))
router.post('/', [validate({ body: usuarioRolCreateSchema })], Call(UsuarioRolController.store));
router.get('/by_id', Call(UsuarioRolController.show));
router.put('/by_id', [validate({ body: usuarioRolCreateSchema })], Call(UsuarioRolController.update));
router.delete('/by_id', Call(UsuarioRolController.destroy));

export default router;
