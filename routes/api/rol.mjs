import { Router } from 'express';
import validate from '../../app/middlewares/validate.mjs';
import RolController from '../../app/controllers/RolController.mjs';
import rolCreateSchema from '../../app/schemas/RolCreateSchema.mjs';
import rolesDeleteSchema from '../../app/schemas/RolesDeleteSchema.mjs';
import Call from '../../app/utils/Call.mjs';

const router = Router();
router.get('/', Call(RolController.index));
// router.post('/', [validate({body: usuarioCreateSchema})], Call(UsuarioController.store))
router.post('/', [validate(rolCreateSchema)], Call(RolController.store));
router.get('/:id', Call(RolController.show));
router.put('/:id', [validate(rolCreateSchema)], Call(RolController.update));
router.delete('/', validate(rolesDeleteSchema), Call(RolController.destroy));

export default router;
