import { Router } from 'express';
import validate from '../../app/middlewares/validate.mjs';
import PerfilController from '../../app/controllers/PerfilController.mjs';
// eslint-disable-next-line import/no-named-as-default
import perfilCreateSchema from '../../app/schemas/PerfilCreateSchema.mjs';
import Call from '../../app/utils/Call.mjs';

const router = Router();
router.get('/', Call(PerfilController.index));
router.post('/', [validate(perfilCreateSchema)], Call(PerfilController.store));
router.get('/:id', Call(PerfilController.show));
router.put('/:id', [validate(perfilCreateSchema)], Call(PerfilController.update));
router.delete('/:id', Call(PerfilController.destroy));
router.put('/updateroles/:id', Call(PerfilController.updatePerfilRol));

export default router;
