import NotFoundExeption from "../../handlers/NotFoundExeption.mjs";
import {Router} from "express";

let Server = Router()

const _config = (url, middelwares = [], method, verb) => {
    Server[verb](url, middelwares, (req, res, next) => {
        return method(req, res).catch(e => {
            next(e)
        })
    })
}


export default class Route {

    get(url, middelwares = [], method) {
        return _config(url, middelwares, method, 'get')
    }

    post(url, middelwares = [], method) {
        return _config(url, middelwares, method, 'post')
    }

    put(url, middelwares = [], method) {
        return _config(url, middelwares, method, 'put')
    }

    delete(url, middelwares = [], method) {
        return _config(url, middelwares, method, 'delete')
    }

    notFound(url) {
        Server.all(url, (req) => {
            console.log("info",req)
            throw new NotFoundExeption()
        })
    }

    getALL() {
        return Server
    }
}