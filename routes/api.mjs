import {Router} from "express";
import routesUsers from './api/usuario.mjs'
import LoginController from "../app/controllers/LoginController.mjs";
import auth from "../app/middlewares/Auth.mjs";

const router = Router()

router.post('/login', LoginController.login)

router.use('/users',[auth], routesUsers)

export default router