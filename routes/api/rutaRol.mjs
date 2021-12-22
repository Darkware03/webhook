import RutaRolController from "../../app/controllers/RutaRolController.mjs";
import {validate} from "express-jsonschema";
import {Router} from "express";
import Call from "../../app/utils/Call.mjs";

const router = Router()
router.get('/', Call(RutaRolController.index))
// router.post('/', [validate({body: usuarioCreateSchema})], Call(UsuarioController.store))
router.post('/', Call(RutaRolController.store))
router.get('/:id', Call(RutaRolController.show))
router.put('/:id', Call(RutaRolController.update))
router.delete('/:id', Call(RutaRolController.destroy))

export default router