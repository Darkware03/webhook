import UsuarioController from "../../app/controllers/UsuarioController.mjs";
export const usuario=(api)=>{
    api.route.get('/users', UsuarioController.index)
    api.route.post('/users', UsuarioController.store)
    api.route.put('/users/:id', UsuarioController.update)
    api.route.delete('/users/:id', UsuarioController.destroy)
}
