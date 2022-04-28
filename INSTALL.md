# Plantilla REST

A continuación se muestra la guía para la instalación de la plantilla para una REST, basada en:

- Entorno de ejecución Node.js 14.
- Framework de aplicación back end web.
- Autenticación Json Web Token (jsonwebtoken).
- Open Api Specification, AKA Swagger (swagger-ui-express).
- Ajv JSON schema validator (ajv).

## Contenido

- [Requisitos](#requisitos)
  - [Software](#1-software)
- [Instalación del aplicación](#instalación-de-la-aplicación)
  - [Instalación y configuración de la plantilla](#1-instalación-y-configuración-de-la-plantilla)
    - [Clonación del proyecto](#11-clonación-del-proyecto)
    - [Instalación de modules](#12-instalación-de-modules)
    - [Configurar la conexión a la base de datos](#13-configurar-las-conexiones-a-la-base-de-datos)
    - [Ejecución de migraciones](#14-ejecución-de-migraciones)
    - [Pruebas de acceso a la API](#15-pruebas-de-acceso-a-la-api)

## Requisitos

### 1 Software

| Software          | Versión |
| ----------------- | ------- |
| PostgreSQL        | \>= 11  |
| NodeJs            | \>=14   |


### 2 Cliente API

Para el consumo de la API es necesario que cliente se conecte a través del protocolo HTTP y permita ejecutar los métodos **GET, POST, PUT, DELETE**.

## Instalación de la aplicación

En esta sección se brinda una serie de pasos a seguir para la instalación del software, como se ha mencionado anteriormente, la instalación se realizará bajo el entorno del Sistema Operativo Linux.

### 1 Instalación y configuración de la plantilla

A continuación se listan los pasos para la instalación y configuración de la API-REST:

#### 1.1 Clonación del proyecto

Clonar el proyecto desde los repositorios oficiales ejecutando el siguiente comando:

```bash
git clone http://codigo.salud.gob.sv/plantillas/JavasScript/api-node-express.git
```

#### 1.2 Instalación de modules

Instalar los modules en el directorio raíz del proyecto ejecutando el siguiente comando:

```bash
npm install
```

#### 1.3 Configurar la conexión a la base de datos

Se debe especificar en el archivo **`.env`** los datos de la conexión a la BD:

Crear el archivo **.env** en el directorio raíz del proyecto ejecutando el siguiente comando

```bash
cp .env.example .env
```

Descomentar y editar la siguiente línea del archivo **.env**

```bash
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=api_nodes
DB_USERNAME=admin
DB_PASSWORD=admin
```

#### 1.4 Ejecución de migraciones
Ejecutar el siguiente comando para iniciar el servidor nodemon:
```bash
npm run start
```
Crear el esquema de la base de datos segun las migraciones con el siguiente comando:
```bash
npm run migration:run
```

Ejecutar los seeders para poblar la base de datos para configurar roles, perfiles y rutas con el siguiente comando en la terminal:
```bash
npm run seed:run:all
```
Luego de realizar los pasos anteriores iniciar el servidor a través del comando:
```bash
npm run start
```

#### 1.5 Pruebas de acceso a la API

Una vez realizado los pasos anteriores puede realizar las pruebas de acceso, para ello puede acceder a la documentación de la **[forma de uso](README.md#forma-de-uso)** del **[README.md](README.md)**
