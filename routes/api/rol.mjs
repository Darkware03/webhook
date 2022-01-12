import { validate } from 'express-jsonschema';
import { Router } from 'express';
import RolController from '../../app/controllers/RolController.mjs';
import rolCreateSchema from '../../app/schemas/RolCreateSchema.mjs';
import Call from '../../app/utils/Call.mjs';

const router = Router();
router.get('/', Call(RolController.index));
// router.post('/', [validate({body: usuarioCreateSchema})], Call(UsuarioController.store))
router.post('/', [validate({ body: rolCreateSchema })], Call(RolController.store));
router.get('/:id', Call(RolController.show));
router.put('/:id', [validate({ body: rolCreateSchema })], Call(RolController.update));
router.delete('/:id', Call(RolController.destroy));

export default router;
