import UsuarioPerfilController from "../../app/controllers/UsuarioPerfilController.mjs";
import {validate} from "express-jsonschema";
import {usuarioPerfilCreateSchema} from '../../app/schemas/UsuarioPerfilCreateSchema.mjs'
import {Router} from "express";
import Call from "../../app/utils/Call.mjs";

const router = Router()
router.get('/', Call(UsuarioPerfilController.index))
// router.post('/', [validate({body: usuarioCreateSchema})], Call(UsuarioPerfilController.store))
router.post('/', Call(UsuarioPerfilController.store))
router.get('/:id', Call(UsuarioPerfilController.show))
router.put('/:id', Call(UsuarioPerfilController.update))
router.delete('/:id', Call(UsuarioPerfilController.destroy))

export default router