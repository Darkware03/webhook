import { Router } from 'express';
import validate from '../../app/middlewares/validate.mjs';
import PerfilController from '../../app/controllers/PerfilController.mjs';
// eslint-disable-next-line import/no-named-as-default
import perfilCreateSchema from '../../app/schemas/PerfilCreateSchema.mjs';
import perfilUpdateSchema from '../../app/schemas/PerfilUpdateSchema.mjs';

import Call from '../../app/utils/Call.mjs';
import AddPerfilRolesSchema from '../../app/schemas/AddPerfilRolesSchema.mjs';
import validateRole from '../../app/middlewares/validateRole.mjs';

const router = Router();
router.get('/', [validateRole('ROLE_PROFILE_LIST')], Call(PerfilController.index));
router.post('/', [validateRole('ROLE_PROFILE_CREATE'), validate(perfilCreateSchema)], Call(PerfilController.store));
router.get('/:id', [validateRole('ROLE_PROFILE_LIST')], Call(PerfilController.show));
router.put('/:id', [validateRole('ROLE_PROFILE_UPDATE'), validate(perfilUpdateSchema)], Call(PerfilController.update));
router.delete('/:id', [validateRole('ROLE_PROFILE_DELETE')], Call(PerfilController.destroy));
router.post('/:id_perfil/roles', [validateRole('ROLE_PROFILE_ROL_CREATE'), validate(AddPerfilRolesSchema)], Call(PerfilController.addPerfilRol));
router.delete('/:id_perfil/roles', [validateRole('ROLE_PROFILE_ROL_DELETE')], Call(PerfilController.destroyPerfilRol));

export default router;
