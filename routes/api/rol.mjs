import { Router } from 'express';
import validate from '../../app/middlewares/validate.mjs';
import RolController from '../../app/controllers/RolController.mjs';
import rolCreateSchema from '../../app/schemas/RolCreateSchema.mjs';
import Call from '../../app/utils/Call.mjs';
import validateRole from '../../app/middlewares/validateRole.mjs';

const router = Router();
router.get('/', [validateRole('ROLE_ROL_VIEW')], Call(RolController.index));
// router.post('/', [validate({body: usuarioCreateSchema})], Call(UsuarioController.store))
router.post('/', [validate(rolCreateSchema), validateRole('ROLE_ROL_CREATE')], Call(RolController.store));
router.get('/:id', [validateRole('ROLE_ROL_VIEW')], Call(RolController.show));
router.put('/:id', [validate(rolCreateSchema), validateRole('ROLE_ROL_UPDATE')], Call(RolController.update));
router.delete('/:id', [validateRole('ROLE_ROL_DELETE')], Call(RolController.destroy));

export default router;
