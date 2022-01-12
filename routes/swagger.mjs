//Aquí se hace el routing hacia la documentación de la API.
import { Router } from "express";
import swaggerUiExpress from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import {dirname} from 'path';
import { fileURLToPath } from "url";
//Creando variable encargada de la direccion del archivo YAML principal
const __dirname = dirname(fileURLToPath(import.meta.url));
//Se lee el archivo openapi.YAML que se cargará en /api/docs/local (swagger interno)
const swaggerDocument = YAML.load(path.join(__dirname,'../app/docs/index.yaml'));
//Se lee el archivo openapi.YAML que se cargará en /api/docs (swagger publico)
const swaggerDocumentPublic = YAML.load(path.join(__dirname,'../app/docs/index.yaml'));
const router = Router();

//cambio del titulo del swagger interno
swaggerDocument["info"]["title"] = "Documentación de la API de la Plantilla - Development"

//correcion del swagger publico, aqui se eliminan los paths con la propiedad "area: development"
for (const path in swaggerDocumentPublic["paths"]){
    //comprueba si existe una propiedad "area: development"
    if(swaggerDocumentPublic["paths"][path]["area"]=="development"){
        delete swaggerDocumentPublic["paths"][path]
    }
}

//Se establece la ruta hacia el Swagger Interno
router.use('/local',swaggerUiExpress.serveFiles(swaggerDocument),swaggerUiExpress.setup(swaggerDocument))
//Se establece la ruta hacia el swagger publico
router.use('/',swaggerUiExpress.serveFiles(swaggerDocumentPublic),swaggerUiExpress.setup(swaggerDocumentPublic));



export default router