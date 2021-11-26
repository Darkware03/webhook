import Route from "../app/nucleo/Route.mjs";
import UsuarioController from "../app/controllers/UsuarioController.mjs";


const initRoute = (server) => {
    const route = new Route(server)
    route.get('/api/users', UsuarioController.index)
    route.post('/api/users', UsuarioController.store)
    route.put('/api/users/:id', UsuarioController.update)
    route.delete('/api/users/:id', UsuarioController.destroy)
    route.notFound('*')
}


export default initRoute