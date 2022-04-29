import { Router } from 'express';
import validate from '../../app/middlewares/validate.mjs';
import RolController from '../../app/controllers/RolController.mjs';
import rolCreateSchema from '../../app/schemas/RolCreateSchema.mjs';
import Call from '../../app/utils/Call.mjs';
import validateRole from '../../app/middlewares/validateRole.mjs';

const router = Router();
router.get('/', [validateRole('ROLE_ROLE_LIST')], Call(RolController.index));
router.post('/', [validate(rolCreateSchema), validateRole('ROLE_ROLE_CREATE')], Call(RolController.store));
router.get('/:id', [validateRole('ROLE_ROLE_LIST')], Call(RolController.show));
router.put('/:id', [validate(rolCreateSchema), validateRole('ROLE_ROLE_UPDATE')], Call(RolController.update));
router.delete('/:id', [validateRole('ROLE_ROLE_DELETE')], Call(RolController.destroy));

export default router;
