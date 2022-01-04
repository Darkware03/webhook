import PerfilRolController from "../../app/controllers/PerfilRolController.mjs";
import { validate } from "express-jsonschema";
import { Router } from "express";
import Call from "../../app/utils/Call.mjs";
import {perfilRolCreateSchema} from "../../app/schemas/PerfilRolCreateSchema.mjs";

const router = Router()
router.get('/', Call(PerfilRolController.index))
// router.post('/', [validate({body: usuarioCreateSchema})], Call(UsuarioController.store))
router.post('/', [validate({body: perfilRolCreateSchema})], Call(PerfilRolController.store))
router.get('/:id', Call(PerfilRolController.show))
router.put('/:id', [validate({body: perfilRolCreateSchema})], Call(PerfilRolController.update))
router.delete('/:id', Call(PerfilRolController.destroy))

export default router