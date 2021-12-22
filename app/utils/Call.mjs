// const Call = (method) => {
//     return (req, res, next) => {
//         return method(req, res).catch(e => next(e))
//     }
// }

const Call = (method) => {
    return (req, res, next) => {
        try {
            method(req, res)
        } catch (error) {
            console.log(error);
        }
    }
}
export default Call