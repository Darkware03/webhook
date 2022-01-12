// Aquí se hace el routing hacia la documentación de la API.
import { Router } from 'express';
import swaggerUiExpress from 'swagger-ui-express';
import YAML from 'yamljs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(fileURLToPath(import.meta.url));
// Se lee el archivo openapi.YAML
const swaggerDocument = YAML.load(path.join(__dirname, '../app/docs/index.yaml'));
const router = Router();

// Se establece la ruta hacia el Swagger usando el archivo openapi.yaml
router.use('/api/docs', swaggerUiExpress.serve);
router.get('/api/docs', swaggerUiExpress.setup(swaggerDocument));

export default router;
