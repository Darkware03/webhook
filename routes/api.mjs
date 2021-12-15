import {Router} from "express";
import routesUsers from './api/usuario.mjs'
import LoginController from "../app/controllers/LoginController.mjs";
import auth from "../app/middlewares/Auth.mjs";
import {validate} from "express-jsonschema";
import {loginSchema} from "../app/schemas/LoginSchema.mjs";
import Call from "../app/utils/Call.mjs";

const router = Router()

router.post('/login', [validate({body: loginSchema})], Call(LoginController.login))

router.use('/users', [auth], routesUsers)

export default router