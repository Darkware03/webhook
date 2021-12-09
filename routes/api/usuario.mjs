import UsuarioController from "../../app/controllers/UsuarioController.mjs";
import {validate} from "express-jsonschema";
import {usuarioCreateSchema} from '../../app/schemas/UsuarioCreateSchema.mjs'
import Auth from "../../app/middlewares/Auth.mjs";
import {Router} from "express";

const router = Router()
router.get('/', [Auth], UsuarioController.index)
router.post('/', [Auth, validate({body: usuarioCreateSchema})], UsuarioController.store)
router.put('/:id', [Auth], UsuarioController.update)
router.delete('/:id', [Auth], UsuarioController.destroy)

export default router