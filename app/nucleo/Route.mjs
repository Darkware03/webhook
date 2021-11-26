import NotFoundExeption from "../../handlers/NotFoundExeption.mjs";

let Server = null

const _config = (url, method, verb) => {
    return Server.app[verb](url, (req, res, next) => {
        return method(req, res).catch(e => {
            next(e)
        })
    })
}

export default class Route {
    constructor(server) {
        Server = server
    }

    get(url, method) {
        return _config(url, method, 'get')
    }

    post(url, method) {
        return _config(url, method, 'post')
    }

    put(url, method) {
        return _config(url, method, 'put')
    }

    delete(url, method) {
        return _config(url, method, 'delete')
    }

    notFound(url) {
        Server.app.all(url, () => {
            throw new NotFoundExeption()
        })
    }


}