import {Router} from "express";
import routesUsers from './api/usuario.mjs'
import LoginController from "../app/controllers/LoginController.mjs";

const router = Router()

router.post('/login', LoginController.login)

router.use('/users', routesUsers)

export default router