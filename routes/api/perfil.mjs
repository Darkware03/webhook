import { Router } from 'express';
import { validate } from 'express-jsonschema';
import PerfilController from '../../app/controllers/PerfilController.mjs';
import perfilCreateSchema from '../../app/schemas/PerfilCreateSchema.mjs';
import Call from '../../app/utils/Call.mjs';

const router = Router();
router.get('/', Call(PerfilController.index));
router.post('/', [validate({ body: perfilCreateSchema })], Call(PerfilController.store));
router.get('/:id', Call(PerfilController.show));
router.put('/:id', [validate({ body: perfilCreateSchema })], Call(PerfilController.update));
router.delete('/:id', Call(PerfilController.destroy));

export default router;
