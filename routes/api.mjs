import {Router} from "express";
import routesUsers from './api/usuario.mjs'
import ApiController from "../app/controllers/ApiController.mjs";
import auth from "../app/middlewares/Auth.mjs";
import {validate} from "express-jsonschema";
import {loginSchema} from "../app/schemas/LoginSchema.mjs";
import Call from "../app/utils/Call.mjs";


const router = Router()
router.post('/v1/login', [validate({body: loginSchema})], Call(ApiController.login))
router.post('/v1/refresh',  Call(ApiController.RefreshToken))

router.use('/v1/users', [auth], Call(routesUsers))




export default router