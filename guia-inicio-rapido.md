# Plantilla REST

### Guía de inicio rápido

Plantilla REST que utiliza el Framework Express.js de JavaScript, el objetivo de este proyecto es facilitar y agilizar la generación de Servicios Webs ofreciendo una estructura básica.
Los pasos que se muestran a continuación, están enfocados a introducir al lector a la construcción de una API básica y sencilla, para que éste posteriormente pueda adecuarla a la complejidad de los proyectos requeridos.

## Tabla de Contenido

- [Descripción](#descripción)
- [Instalación](#instalación)
- [Estructura de directorios](#estructura-de-directorios)
- [Preparación de la base](#preparación-de-la-base)
- [Creación de la entidad](#creación-de-la-entidad)
- [Creación del repositorio](#creación-del-repositorio)
- [Creación del controlador](#creación-del-controlador)
- [Creación Métodos REST](#creación-métodos-rest)
  - [HEAD](#head)
  - [GET](#get)
  - [GET/{id}](#getid)
  - [POST](#post)
- [Documentación Swagger](#documentación-swagger)

## Descripción

Proyecto base que puede servir para el desarrollo de un Backend completo (API - REST-FULL, y Admin), basada en:

- Entorno de ejecución Node.js 14.
- Framework de aplicación back end web.
- Autenticación Json Web Token (jsonwebtoken).
- Open Api Specification, AKA Swagger (swagger-ui-express).
- Ajv JSON schema validator (ajv).

## Instalación

Requisitos y pasos de instalación se encuentran definidos en el archivo [**INSTALL.md**](../INSTALL.md), seguir dicha guía para proceder con la instalación y posteriormente su uso.

## Estructura de directorios

A continuación se muestra la estructura de directorios del proyecto.

```
.
├── app
│   ├── controllers
│   ├── db
│   ├── docs
│   ├── events
│   ├── listeners
│   ├── middlewares
│   ├── models
│   ├── nucleo
│   ├── schemas
│   ├── services
│   └── utils
├── configs
├── handlers
│   ├── controllers
│   ├── db
│   ├── docs
│   ├── events
│   ├── listeners
│   ├── middlewares
│   ├── models
│   ├── nucleo
│   ├── schemas
│   └── services
├── public
│   └── index.html
├── routes
│   ├── api
│   ├── api.mjs
│   ├── swagger.mjs
│   └── web.mjs
├── storage
├── tests
│   └── config.mjs
├── .babelrc
├── .env
├── .eslintrc.js
├── .gitignore
├── .prettierrc.json
├── .sequelizerc
├── app.js
├── babel.config.js
├── guia-inicio-rapido.md
├── INSTALL.md
├── jest.config.js
├── main.mjs
├── package-lock.json
├── package.json
├── README.md
├── webpack.config.build.js
└── webpack.config.js
```

De la estructura anterior se destacarán los siguientes archivos y directorios los cuales serán de importancia para el desarrollo del servicio web:
- **app:** Directorio principal donde se almancenan todos los archivos que manejan la lógica del sistema.
  - **controller**: Contiene los archivos en el que se manejan la lógica de las rutas (Endpoint) del Servicio Web.
  - **db**: Contiene los archivos de clases relacionados a las tablas de la base de datos del aplicativo.
    - **migrations**: Contiene los archivos donde se definen las migraciones para crear el esquema de la base de datos.
    - **seeders**: Contiene los archivos donde se definen los datos iniciales que tendra la base de datos.
  - **docs**: Contiene los archivos y directorios para la configutación de la documentacion en swagger.
    - **swagger**: Contienen los archivos y directorios para definir documentación de endpoints.
      - **paths**: Contiene los archivos donde se define la documentación de cada ruta (Endpoint).
      - **schemas**: Contiene los esquemas que son utilizados para definir la estructura que sera utilizada en los archivos del directorio path
        - **include.yaml**: Archivo donde se declaran los schemas para utilizarlos en los archivos del directorio path.
  - **models**: Contiene los archivos donde se definen las entidades según la base de datos.
  - **schemas**: Directorio donde se almacenan los esquemas para validar el cuerpo de cada petición.
- **handlers**: Directorio donde se almacenan clases para el manejo de excepciones.
- **routes:** Directorio que contiene los archivos para definir las rutas (Endpoint).

## Preparación de la base

En este apartado se asume que el lector tiene creada y configurada una base de datos según la guía de instalación. En la base de datos crear una tabla con el nombre de **libro** y cuya estructura sea similar a la siguiente:

```
            Tabla «libro»
      Columna      | Tipo   | Nullable
-------------------+--------+----------
 id                | serial | not null
 isbn              | text   |
 descripcion       | text   |
 autor             | text   |
 fecha_publicacion | date   |
Índices:
    "pk_libro" PRIMARY KEY (id)
```

**Datos de ejemplo.**

Cargar el archivo **CSV** [**libros.csv**](https://next.salud.gob.sv/index.php/s/rHz5n4cz4KGSR93/download) en la tabla `libro` el cual contiene datos de ejemplo que se requerirán para el desarrollo de esta guía.

## Creación de la entidad

Antes de comenzar con la creación del controlador es necesario la creación de la modelo en la carpeta app/models.

Posterior a la creación de la modelo, editar el archivo `Libro.mjs` que se encuentra en el directorio `app/models` y agregar al final de la clase la función `__toString` tal y como se muestra a continuación:

**Libro.mjs**

```mjs
import psql from 'sequelize';
import DB from '../nucleo/DB.mjs';

class Libro extends psql.Model {
}

Libro.init({
  id: {
    type: psql.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  isbn: {
    type: psql.Sequelize.STRING,
    allowNull: true,
  },
  descripcion: {
    type: psql.Sequelize.STRING,
    allowNull: true,
  },
  autor: {
    type: psql.Sequelize.STRING,
    allowNull: true,
  },
  fecha_publicacion: {
    type: psql.Sequelize.DATE,
    allowNull: true,
  },
}, {
  timestamps: false,
  tableName: 'refresh_tokens',
  sequelize: DB.connection(),
});

export {
  Libro,
};

export default Libro;
```

## Creación del controlador

Antes de comenzar con la creación de los métodos es necesario la creación del controlador que los contendrá. Para ello se recomienda crear un controlador por cada recurso que se ha de poner a disposición, para esta guía se debe de crear el controlador llamado `LibroController.mjs` dentro del directorio `app/controllers` de la plantilla, dicho archivo debe de tener el siguiente contenido:

**LibroController.mjs**
```mjs
import { Libro } from '../models/index.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import UnprocessableEntityException from '../../handlers/UnprocessableEntityException.mjs';
import BadRequestException from '../../handlers/BadRequestException.mjs';

export default class LibroController {
    //codigo
}

```
## Creación Métodos REST
Una vez ya configurado y ejecutándose la app, lo siguiente es crear los **endpoints** o métodos del servicio web que permitirá la interacción con el cliente, basándose en los [Estándares de Desarrollo de Servicios Web](https://github.com/klb-rodriguez/EstandaresInteroperabilidad/blob/master/Desarrollo.md) desarrollados por diferentes instituciones en coordinación con Gobierno Electrónico de El Salvador.

### get
Endpoint que permite listar todos los libros según los parámetros de búsqueda proporcionados.

Editar el archivo `LibroController.php` que se encuentra dentro del directorio `app/LibroController` y agregar el código que se lista a continuación:
**LibroController.mjs**

```mjs
//codigo

export default class LibroController {
    //codigo
 static async index(req, res) {
    const libros = await Libro.findAll();
    return res.status(HttpCode.HTTP_OK).json(libros);
  }
}

```
### POST
Enpoint que permite insertar libros a la base a través del servicio web.
versión: **v1**
uri: **/libros** (Lo crearemos luego)
datos de entrada: **JSONs**
dato de respuesta: **JSON**
En el directorio `app/schemas` crear un directorio si no existiera llamado `schemas`, y además crear un archivo llamado **libroCreateSchema.mjs** el cual debe de contener las restricciones JSON que se han de utilizar para validar los datos entrantes como el siguiente código:
**libroCreateSchema.mjs**
```mjs
const libroCreateSchema = {
  type: 'object',
  properties: {
    isbn: {
      type: 'string',libroCreateSchema.mjs
      errorMessage: {
        type: 'El ISBN debe ser de tipo alfanumerico',
      },
    },
    descripcion: {
      type: 'string',
      maxLength: 100,
      errorMessage: {
        type: 'La descripcion debe ser de tipo alfanumerico',
        maxLength: 'La descripcion debe ser de 100 caracteres',
      },
    },
    autor: {
      type: 'string',
      errorMessage: {
        type: 'El nombre del autor debe ser de tipo alfanumerico',
      },
    },
    fecha_publicacion: {
      type: 'string',
      format: 'date',
      errorMessage: {
        type: 'La fecha de publicacion debe ser de tipo date',
      },
    },
  },
  required: ['isbn', 'descripcion', 'autor', 'fecha_publicacion'],
  errorMessage: {
    required: {
      isbn: 'El ISBN es requerido',
      descripcion: 'La descripción es requerida',
      autor: 'El autor es requerido',
      fecha_publicacion: 'La fecha de publicación es requerida',
    },
  },
};
export default libroCreateSchema;

```

Para más información ver la documentación oficial de [JsonSchema](https://json-schema.org/learn/getting-started-step-by-step.html)
Editar el archivo `LibroController.mjs` que se encuentra dentro del directorio `app/controllers`, asegurarse de haber importado todas las librerías que se definieron en la sección de [Creación del controlador](#creación-del-controlador) de esta guía. Agregar el código que se lista a continuación:

**LibroController.mjs**
```mjs
//codigo

export default class LibroController {
   
   //codigo

 static async store(req, res) {
   const { isbn, descripcion, autor, fecha_publicacion } = req.body;

    const libro = await Libro.create({
      isbn,
      descripcion,
      autor,
      fecha_publicacion,
    });
    return res.status(HttpCode.HTTP_OK).json(libro);
  }
}

```

### Routes
Ahora procedemos a crear las rutas de los controladores que hemos realizado, dentro del directorio `app/routes/api` crearemos un archivo llamado `libro.mjs`, y el codigo listado a continuación:

**libro.mjs**
```mjs
import { Router } from 'express';
import validate from '../../app/middlewares/validate.mjs';
import Call from '../../app/utils/Call.mjs';
import LibroController from '../../app/controllers/LibroController.mjs';
import libroCreateSchema from '../../app/schemas/libroCreateSchema.mjs';

const router = Router();

router.get('/', Call(LibroController.index));
router.post('/', [validate(libroCreateSchema)], Call(RolController.store));

export default router;
```

Ahora que tenemos la ruta procedemos a agregarlas en `api.mjs` ubicado en directorio `app/routes`, agregamos el codigo a continuación:

```mjs
//codigo 
import routesLbros from './api/libro.mjs';

router.use('/v1/libros', [auth], routesLbros);
```

## Documentación Swagger
Gracias a lasdafdwefiuaeuir