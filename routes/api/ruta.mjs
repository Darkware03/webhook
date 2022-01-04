import RutaController from "../../app/controllers/RutaController.mjs";
import {rutaCreateSchema} from '../../app/schemas/RutaCreateSchema.mjs';
import {validate} from "express-jsonschema";
import {Router} from "express";
import Call from "../../app/utils/Call.mjs";

const router = Router()
router.get('/', Call(RutaController.index))
// router.post('/', [validate({body: usuarioCreateSchema})], Call(UsuarioController.store))
router.post('/', [validate({body: rutaCreateSchema})], Call(RutaController.store))
router.get('/:id', Call(RutaController.show))
router.put('/:id', [validate({body: rutaCreateSchema})], Call(RutaController.update))
router.delete('/:id', Call(RutaController.destroy))

export default router