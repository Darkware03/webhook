//Aquí se hace el routing hacia la documentación de la API.
import { Router } from "express";
import swaggerUiExpress from "swagger-ui-express";

import {createRequire} from 'module';

const require = createRequire(import.meta.url);
const swaggerJson = require("../openapi.json");

const router = Router();
router.use('/api-docs',swaggerUiExpress.serve);
router.get('/api-docs',swaggerUiExpress.setup(swaggerJson))


export default router