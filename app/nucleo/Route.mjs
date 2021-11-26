import NotFoundExeption from "../../handlers/NotFoundExeption.mjs";
import {Router} from "express";

let Server = Router()

const _config = (url, method, verb) => {
    Server[verb](url, (req, res, next) => {
        return method(req, res).catch(e => {
            next(e)
        })
    })
}


export default class Route {

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
        Server.all(url, () => {
            throw new NotFoundExeption()
        })
    }

    getALL() {
        return Server
    }
}