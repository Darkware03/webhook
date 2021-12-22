import PerfilRolController from "../../app/controllers/PerfilRolController.mjs";
import { validate } from "express-jsonschema";
import { Router } from "express";
import Call from "../../app/utils/Call.mjs";

const router = Router()
router.get('/', Call(PerfilRolController.index))
// router.post('/', [validate({body: usuarioCreateSchema})], Call(UsuarioController.store))
router.post('/', Call(PerfilRolController.store))
router.get('/:id', Call(PerfilRolController.show))
router.put('/:id', Call(PerfilRolController.update))
router.delete('/:id', Call(PerfilRolController.destroy))

export default router