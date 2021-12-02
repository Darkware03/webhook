import UsuarioController from "../../app/controllers/UsuarioController.mjs";
import Auth from "../../app/middlewares/Auth.mjs";
export const usuario=(api)=>{
    api.route.get('/users', [Auth],UsuarioController.index)
    api.route.post('/users', UsuarioController.store)
    api.route.put('/users/:id', UsuarioController.update)
    api.route.delete('/users/:id', UsuarioController.destroy)
}
