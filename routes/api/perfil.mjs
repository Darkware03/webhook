import { Router } from 'express';
import validate from '../../app/middlewares/validate.mjs';
import PerfilController from '../../app/controllers/PerfilController.mjs';
// eslint-disable-next-line import/no-named-as-default
import perfilCreateSchema from '../../app/schemas/PerfilCreateSchema.mjs';
import perfilUpdateSchema from '../../app/schemas/PerfilUpdateSchema.mjs';

import Call from '../../app/utils/Call.mjs';
import validateRole from '../../app/middlewares/validateRole.mjs';

const router = Router();
router.get('/', [validateRole('ROLE_PROFILE_LIST')], Call(PerfilController.index));
router.post('/', [validateRole('ROLE_PROFILE_CREATE'), validate(perfilCreateSchema)], Call(PerfilController.store));
router.get('/:id', [validateRole('ROLE_PROFILE_LIST')], Call(PerfilController.show));
router.put('/:id', [validateRole('ROLE_PROFILE_UPDATE'), validate(perfilUpdateSchema)], Call(PerfilController.update));

export default router;
