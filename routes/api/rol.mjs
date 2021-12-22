import RolController from "../../app/controllers/RolController.mjs";
// import rolCreateSchema from '../../app/schemas/RolCreateSchema.mjs'
import {validate} from "express-jsonschema";
import {Router} from "express";
import Call from "../../app/utils/Call.mjs";

const router = Router()
router.get('/', Call(RolController.index))
// router.post('/', [validate({body: usuarioCreateSchema})], Call(UsuarioController.store))
router.post('/', Call(RolController.store))
router.get('/:id', Call(RolController.show))
router.put('/:id', Call(RolController.update))
router.delete('/:id', Call(RolController.destroy))

export default router