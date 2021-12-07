import UsuarioController from "../../app/controllers/UsuarioController.mjs";
import {validate} from "express-jsonschema";
import {usuarioCreateSchema} from '../../app/schemas/UsuarioCreateSchema.mjs'

export const usuario = (api) => {
    api.route.get('/users', [api.middelwares], UsuarioController.index)
    api.route.post('/users', [api.middelwares, validate({body: usuarioCreateSchema})], UsuarioController.store)
    api.route.put('/users/:id', [api.middelwares], UsuarioController.update)
    api.route.delete('/users/:id', [api.middelwares], UsuarioController.destroy)
}
