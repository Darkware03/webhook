import BaseError from "./BaseError.mjs";

export default class Handler {

    static logError(err) {
        console.error(err)
    }

    static logErrorMiddleware(err, req, res, next) {
        Handler.logError(err)
        next(err)
    }

    static handlerError(err, req, res, next) {
        const debug = process.env.APP_DEBUG === 'true'

        if (err.name && err.name === 'JsonSchemaValidation')
            return res.status(400).json(err.validations.body)

        if (debug)
            return res.status(err.statusCode || 500).json(err)


        return res.status(err.statusCode || 500).json({
            message: err.message
        })
    }

    static isOPerationalError(error) {
        if (error instanceof BaseError)
            return error.isOperational

        return false
    }
}