import UsuarioRolController from "../../app/controllers/UsuarioRolController.mjs";
import {validate} from "express-jsonschema";
import {usuarioCreateSchema} from '../../app/schemas/UsuarioCreateSchema.mjs'
import {Router} from "express";
import Call from "../../app/utils/Call.mjs";

const router = Router()
router.get('/', Call(UsuarioRolController.index))
// router.post('/', [validate({body: usuarioCreateSchema})], Call(UsuarioRolController.store))
router.post('/', Call(UsuarioRolController.store))
router.get('/:id', Call(UsuarioRolController.show))
router.put('/:id', Call(UsuarioRolController.update))
router.delete('/:id', Call(UsuarioRolController.destroy))

export default router