/* eslint-disable guard-for-in */
// Aquí se hace el routing hacia la documentación de la API.
import { Router } from 'express';
import swaggerUiExpress from 'swagger-ui-express';
import YAML from 'yamljs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import fs from 'fs';
// Creando variable encargada de la direccion del archivo YAML principal
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(fileURLToPath(import.meta.url));
// Se lee el archivo openapi.YAML que se cargará en /api/docs/local (swagger interno)
const swaggerDocument = YAML.load(path.join(__dirname, '../app/docs/index.yaml'));
// Se lee el archivo openapi.YAML que se cargará en /api/docs (swagger publico)
const swaggerDocumentPublic = YAML.load(path.join(__dirname, '../app/docs/index.yaml'));
// Se lee el archivo openapi.YAML para eliminar la propiedad area de los paths.
const swaggerDocumentModify = YAML.load(path.join(__dirname, '../app/docs/index.yaml'));

const router = Router();

// eslint-disable-next-line no-restricted-syntax
for (const pat in swaggerDocumentModify.paths) {
  delete swaggerDocumentModify.paths[pat].area;
}

const swaggerTemporal = yaml.dump(swaggerDocumentModify);
fs.writeFileSync(path.join(__dirname, '../app/docs/test.yaml'), swaggerTemporal, 'utf8');

// cambio del titulo del swagger interno
swaggerDocument.info.title = 'Documentación de la API de la Plantilla - Development';

// correcion del swagger publico, aqui se eliminan los paths con la propiedad "area: development"
// eslint-disable-next-line no-restricted-syntax
for (const pat in swaggerDocumentPublic.paths) {
  // comprueba si existe una propiedad "area: development"
  if (swaggerDocumentPublic.paths[pat].area === 'development') {
    delete swaggerDocumentPublic.paths[pat];
  }
}

// eslint-disable-next-line no-restricted-syntax
for (const pat in swaggerDocument.paths) {
  // comprueba si existe una propiedad "area: development"
  if (swaggerDocument.paths[pat].area === 'api') {
    delete swaggerDocument.paths[pat];
  }
}
// Se establece la ruta hacia el Swagger Interno
router.use(
  '/local',
  swaggerUiExpress.serveFiles(swaggerDocument),
  swaggerUiExpress.setup(swaggerDocument),
);
// Se establece la ruta hacia el swagger publico
router.use(
  '/docs',
  swaggerUiExpress.serveFiles(swaggerDocumentPublic),
  swaggerUiExpress.setup(swaggerDocumentPublic),
);
// Ruta del archivo json de la documentacion
router.use('/api/doc.json', (req, res) => {
  res.header('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, '../app/docs/test.json'));
});

export default router;
