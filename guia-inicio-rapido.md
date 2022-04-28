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

