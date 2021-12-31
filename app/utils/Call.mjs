const Call = (method) => {
    return (req, res, next) => {
        return method(req, res).catch(e => next(e))
    }
}

export default Call