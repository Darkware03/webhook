import request from "supertest";
import Server from "../configs/server.mjs";

const host = `${Server.host}:${Server.port}`

describe('test de creacion de usuarios', () => {
    test('name test', (done) => {
        request(host)
            .get('/api/users')
            .then(response => {
                expect(response.statusCode).toBe(200)
                done()
            }).catch((err) => {
            done(err)
        })
    })
})
