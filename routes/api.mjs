import UsuarioController from "../app/controllers/UsuarioController.mjs";
import Prefix from "../app/middlewares/Prefix.mjs";

const initRoute = (server) => {
    const api = new Prefix(server, '/api')
    api.route.get('/users', UsuarioController.index)
    api.route.post('/users', UsuarioController.store)
    api.route.put('/users/:id', UsuarioController.update)
    api.route.delete('/users/:id', UsuarioController.destroy)
    api.route.notFound('*')
    api.generate()
}


export default initRoute