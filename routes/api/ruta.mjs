import { Router } from 'express';
import validate from '../../app/middlewares/validate.mjs';
import RutaController from '../../app/controllers/RutaController.mjs';
import rutaCreateSchema from '../../app/schemas/RutaCreateSchema.mjs';
import Call from '../../app/utils/Call.mjs';
import usuarioAddUserRoleSchema from '../../app/schemas/UsuarioAddUserRoleSchema.mjs';
import validateRole from '../../app/middlewares/validateRole.mjs';

const router = Router();

router.get('/', [validateRole('ROLE_PATH_LIST')], Call(RutaController.index));

router.post('/', [validateRole('ROLE_PATH_CREATE'), validate(rutaCreateSchema)], Call(RutaController.store));
router.get('/get-rutas', Call(RutaController.getRutas));
router.get('/:id', [validateRole('ROLE_PATH_LIST')], Call(RutaController.show));
router.put('/:id', [validateRole('ROLE_PATH_UPDATE'), validate(rutaCreateSchema)], Call(RutaController.update));
router.delete('/:id', [validateRole('ROLE_PATH_DELETE')], Call(RutaController.destroy));
router.post('/:id_ruta/roles', [validateRole('ROLE_PATH_ROLE_CREATE'), validate(usuarioAddUserRoleSchema)], Call(RutaController.addRutaRole));
router.delete('/:id_ruta/roles', [validateRole('ROLE_PATH_ROLE_DELETE')], Call(RutaController.destroyRutaRol));

export default router;
