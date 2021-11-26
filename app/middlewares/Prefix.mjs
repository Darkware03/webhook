import Route from "../nucleo/Route.mjs";

export default class Prefix {
    constructor(server, prefix) {
        this.server = server
        this.prefix = prefix
        this.route = new Route()
    }

    generate() {
        this.server.app.use(this.prefix, this.route.getALL())
    }


}