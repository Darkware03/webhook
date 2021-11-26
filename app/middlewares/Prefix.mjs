import Route from "../nucleo/Route.mjs";
import Server from "../../configs/server.mjs";

export default class Prefix {
    constructor(prefix) {
        this.server = Server
        this.prefix = prefix
        this.route = new Route()
    }

    generate() {
        this.server.app.use(this.prefix, this.route.getALL())
    }
}