import UsuarioController from "../../app/controllers/UsuarioController.mjs";

export const usuario = (api) => {
    api.route.get('/users', [api.middelwares], UsuarioController.index)
    api.route.post('/users', [api.middelwares], UsuarioController.store)
    api.route.put('/users/:id', [api.middelwares], UsuarioController.update)
    api.route.delete('/users/:id', [api.middelwares], UsuarioController.destroy)
}
