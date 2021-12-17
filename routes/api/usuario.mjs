import UsuarioController from "../../app/controllers/UsuarioController.mjs";
import {validate} from "express-jsonschema";
import {usuarioCreateSchema} from '../../app/schemas/UsuarioCreateSchema.mjs'
import {Router} from "express";
import Call from "../../app/utils/Call.mjs";

const router = Router()
router.get('/', Call(UsuarioController.index))
// router.post('/', [validate({body: usuarioCreateSchema})], Call(UsuarioController.store))
router.post('/', Call(UsuarioController.store))
router.get('/:id', Call(UsuarioController.show))
router.put('/:id', Call(UsuarioController.update))
router.delete('/:id', Call(UsuarioController.destroy))

export default router