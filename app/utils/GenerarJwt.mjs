import jwt from 'jsonwebtoken'

export default class GenerarJwt {
    static async create(PAYLOAD) {
        return new Promise((resolve, reject) => {
            jwt.sign(PAYLOAD, process.env.SECRET_KEY, {
                expiresIn: 60*60
            }, (err, token) => {
                if (err) reject(err)
                else resolve(token)
            })
        })
    }
}