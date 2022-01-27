import { Router } from 'express';
import validate from '../../app/middlewares/validate.mjs';
import PerfilController from '../../app/controllers/PerfilController.mjs';
// eslint-disable-next-line import/no-named-as-default
import perfilCreateSchema from '../../app/schemas/PerfilCreateSchema.mjs';
import perfilUpdateSchema from '../../app/schemas/PerfilUpdateSchema.mjs';

import Call from '../../app/utils/Call.mjs';
import perfilesDeleteSchema from '../../app/schemas/PerfilesDeleteSchema.mjs';

const router = Router();
router.get('/', Call(PerfilController.index));
router.post('/', [validate(perfilCreateSchema)], Call(PerfilController.store));
router.get('/:id', Call(PerfilController.show));
router.put('/:id', [validate(perfilUpdateSchema)], Call(PerfilController.update));
router.delete('/:id', Call(PerfilController.destroy));
router.delete('/', validate(perfilesDeleteSchema), Call(PerfilController.destroyMany));

router.post('/:id_perfil/roles', Call(PerfilController.addPerfilRol));
router.delete('/:id_perfil/roles', Call(PerfilController.destroyPerfilRol));

export default router;
