import { Router } from 'express';
import validate from '../../app/middlewares/validate.mjs';
import RutaController from '../../app/controllers/RutaController.mjs';
import rutaCreateSchema from '../../app/schemas/RutaCreateSchema.mjs';
import Call from '../../app/utils/Call.mjs';
import usuarioAddUserRoleSchema from '../../app/schemas/UsuarioAddUserRoleSchema.mjs';
import validateRole from '../../app/middlewares/validateRole.mjs';

const router = Router();

router.get('/', Call(RutaController.index));

// router.post('/', [validate({body: usuarioCreateSchema})], Call(UsuarioController.store))
router.post('/', [validateRole('ROLE_RUTA_LIST'), validate(rutaCreateSchema)], Call(RutaController.store));
router.get('/get-rutas', [validateRole('ROLE_RUTA_VIEW')], Call(RutaController.getRutas));
router.get('/:id', [validateRole('ROLE_RUTA_VIEW')], Call(RutaController.show));
router.post('/:id_ruta/roles', [validateRole('ROLE_RUTA_ROL_CREATE'), validate(usuarioAddUserRoleSchema)], Call(RutaController.addRutaRole));
router.put('/:id', [validateRole('ROLE_RUTA_UPDATE'), validate(rutaCreateSchema)], Call(RutaController.update));
router.delete('/:id', validateRole('ROLE_RUTA_DELETE'), Call(RutaController.destroy));
router.delete('/:id_ruta/roles', validateRole('ROLE_RUTA_ROL_DELETE'), Call(RutaController.destroyRutaRol));

export default router;
