import UsuarioController from "../../app/controllers/UsuarioController.mjs";
import {validate} from "express-jsonschema";
import {usuarioCreateSchema} from '../../app/schemas/UsuarioCreateSchema.mjs'
import {Router} from "express";
import Call from "../../app/utils/Call.mjs";

const router = Router()
router.get('/', Call(UsuarioController.index))
router.post('/:id_usuario/perfiles', Call(UsuarioController.userProfile))
router.delete('/:id_usuario/perfiles', Call(UsuarioController.destroyUserPerfil))
router.post('/:id_usuario/roles', Call(UsuarioController.userRole))
router.delete('/:id_usuario/roles', Call(UsuarioController.destroyUserRol))
router.put('/:id', Call(UsuarioController.update))
router.delete('/:id', Call(UsuarioController.destroy))
router.post('/', [validate({body: usuarioCreateSchema})], Call(UsuarioController.store)); 
router.get('/:id', Call(UsuarioController.show)); 


export default router