import PerfilController from "../../app/controllers/PerfilController.mjs";
import { validate } from "express-jsonschema";
import { Router } from "express";
import Call from "../../app/utils/Call.mjs";

const router = Router()
router.get('/', Call(PerfilController.index))
// router.post('/', [validate({body: usuarioCreateSchema})], Call(UsuarioController.store))
router.post('/', Call(PerfilController.store))
router.get('/:id', Call(PerfilController.show))
router.put('/:id', Call(PerfilController.update))
router.delete('/:id', Call(PerfilController.destroy))

export default router