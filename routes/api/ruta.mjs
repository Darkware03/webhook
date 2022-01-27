import { Router } from 'express';
import validate from '../../app/middlewares/validate.mjs';
import RutaController from '../../app/controllers/RutaController.mjs';
import rutaCreateSchema from '../../app/schemas/RutaCreateSchema.mjs';
import Call from '../../app/utils/Call.mjs';
import usuarioAddUserRoleSchema from '../../app/schemas/UsuarioAddUserRoleSchema.mjs';

const router = Router();
router.get('/', Call(RutaController.index));
// router.post('/', [validate({body: usuarioCreateSchema})], Call(UsuarioController.store))
router.post('/', [validate(rutaCreateSchema)], Call(RutaController.store));
router.get('/:id', Call(RutaController.show));
router.post('/:id_ruta/roles', [validate(usuarioAddUserRoleSchema)], Call(RutaController.addRutaRole));
router.put('/:id', [validate(rutaCreateSchema)], Call(RutaController.update));
router.delete('/', Call(RutaController.destroy));
router.delete('/:id_ruta/roles', Call(RutaController.destroyRutaRol));

export default router;
