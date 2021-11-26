import NotFoundExeption from "../../handlers/NotFoundExeption.mjs";

export default class Route {
    constructor(server) {
        this.server = server
    }

    get(url, method) {
        return this._config(url,method,'get')
    }

    post(url, method) {
        return this._config(url,method,'post')
    }

    put(url, method) {
       return this._config(url,method,'put')
    }

    delete(url, method) {
        return this._config(url,method,'delete')
    }

    notFound(url) {
        this.server.app.all(url, () => {
            throw new NotFoundExeption()
        })
    }

    _config(url, method, verb) {
        return this.server.app[verb](url, (req, res, next) => {
            return method(req, res).catch(e => {
                next(e)
            })
        })
    }
}