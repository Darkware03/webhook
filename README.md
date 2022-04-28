# Plantilla REST

### Ministerio de Salud de El Salvador (MINSAL)

<div align="center">
	<a href="http://codigo.salud.gob.sv/plantillas/api-rest-admin">
		<img alt="SUIS" title="SUIS" src="https://next.salud.gob.sv/index.php/s/yXfAcAnwakNb779/preview" width="250" style="width: 250px;">
	</a>
</div>

## Tabla de Contenido

- [Descripción](#descripción)
- [Instalación](#instalación)
- [Forma de uso](#forma-de-uso)
- [Primeros pasos](#primeros-pasos)
- [Uso Plugins JS](#uso-plugins-js)
- [Colaboradores](#colaboradores)
- [Enlaces de ayuda](#enlaces-de-ayuda)
- [Licencia](#licencia)

## Descripción

El objetivo de este proyecto es facilitar y agilizar la generación de Servicios Web ofreciendo una estructura básica para iniciar un proyecto nuevo.

Proyecto base que puede servir para el desarrollo de un Backend completo (API - REST-FULL, y Admin), basada en:

- Entorno de ejecución Node.js 14.
- Framework de aplicación back end web.
- Autenticación Json Web Token (jsonwebtoken).
- Open Api Specification, AKA Swagger (swagger-ui-express).
- Ajv JSON schema validator (ajv).

## Instalación

Requisitos y pasos de instalación se encuentran definidos en el archivo [**INSTALL.md**](INSTALL.md), seguir dicha guía para proceder con la instalación y posteriormente su uso.

## Forma de uso

### API

Gracias a la integración de Open Api Specification (Swagger) la plantilla pone a disposición del cliente el listado de servicios disponibles (Endpoints), los cuales pueden ser consumidos a través de un cliente REST o del Navegador Web.

**Cliente REST**

```bash

curl -X GET -H "Accept: application/json" http://localhost:8000/api/doc.json

```

**Navegador Web**

Ingresar a: [http://localhost:8000/docs/](http://localhost:8000/docs/), y se mostrará una pantalla como la siguiente:



![imagen-documentacion](https://next.salud.gob.sv/index.php/s/tz22JEaHsMe8yw7)



### Autenticación

El método de autenticación definido e integrado a la plantilla de desarrollo de APIs es **`JWT`** el cuál utiliza un token para toda la comunicación que se realiza a través de los endpoints que han sido asegurados.

Método: **`POST`**

URI: **`/api/v1/login`**

**Headers:**

| Parámetro | Descripción |

| -----------------------------------: | -------------------------------------------------------------------------------------------------------- |

| `Content-type` <br />_semi-opcional_ | Parámetro que le indica al servidor que tipo de contenido es enviado, valor a enviar: `application/json` |


**Query String:**

> No se requiere ningún parámetro de búsqueda.

**Body: **

Formato: **`JSON`**

| Parámetro | Descripción |

| ---------------------------: | ---------------------------------------------------------------------- |

| `username` <br />_requerido_ | Nombre de usuario con el que se iniciará sesión para obtener el token. |

| `password` <br />_requerido_ | Contraseña con el que se iniciará sesión para obtener el token. |



```json

{

"username": "username",

"password": "passwrod"

}

```



**Response:**



```

HTTP 200 OK

```



```json

{

"token": "string",
"refreshToken": "string"

}

```



**Códigos de respuesta:**



| Código | Descripción |

| -------------------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

| `200`<br />OK | Implica que la petición fue completada exitosamente |

| `400`<br />Bad Request | Implica que hubo un error en la petición, <br />esto puede darse debido a que alguno de los parámetros<br />requeridos de Encabezado o Query String no ha sido proporcionado. |

| `401`<br />Unauthorized | Implica que los datos de acceso son erróneo o que no se posee<br />privilegio para acceder al recurso. |

| `403`<br />Forbidden | Implica que no ha sido posible procesar la operación. |

| `422`<br />Unproccesable Entity | Implica que no ha sido posible procesar la operación. |

| `500`<br />Internal Server Error | Indica que hubo un error interno dentro de la API. |



**Ejemplo de consumo:**

Request:

```bash

curl -X POST -H "Content-Type: application/json" http://localhost:8000/api/v1/login -d '{"username":"admin@salud.gob.sv","password":"admin"}'

```

En donde:



- **admin@salud.gob.sv** Es el nombre de usuario creado en el **[paso 1.4](INSTALL.md#14-ejecución-de-migraciones)** del **[INSTALL.md](INSTALL.md)**.

- **admin:** Es la contraseña del usuario creado en el **[paso 1.4](INSTALL.md#14-ejecución-de-migraciones)** del **[INSTALL.md](INSTALL.md)**.



Response:

```json

{
	"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZXMiOltdLCJlbWFpbCI6InJvbnkuZ2FyY2lhQHNhbHVkLmdvYi5zdiIsInVzZXIiOnsiaWQiOjEsImVtYWlsIjoicm9ueS5nYXJjaWFAc2FsdWQuZ29iLnN2IiwibGFzdF9sb2dpbiI6IjIwMjItMDQtMjhUMDg6NTY6MTctMDY6MDAiLCJ0d29fZmFjdG9yX3N0YXR1cyI6ZmFsc2V9LCJpYXQiOjE2NTExNTc3NzcsImV4cCI6MTY1MTE2MTM3N30.IyXXwXLaGaYdN2HKb3EjA_WswCGIt1UDUXp1HW1tX00","refreshToken":"f022a109-6575-48f8-84d3-8ba52f0a61fc"
}

```



## Primeros pasos



Como parte de esta plantilla se brinda una guía de inicio rápido para la creación de los endpoints de la API de manera muy básica, la intención es brindar al lector conceptos básicos que le permitan crear su primer API, depende de este profundizar en los temas para la creación de APIs mas complejas. Se recomienda leer los enlaces de la documentación a las tecnologías utilizadas.



[**Ver guía de inicio rápido**](./doc/guia-inicio-rapido.md)




## Licencia



<a rel="license" href="https://www.gnu.org/licenses/gpl-3.0.en.html"><img alt="Licencia GNU GPLv3" style="border-width:0" src="https://next.salud.gob.sv/index.php/s/qxdZd5iwcqCyJxn/preview" width="96" /></a>



Este proyecto está bajo la <a rel="license" href="http://codigo.salud.gob.sv/plantillas/api-rest-admin/blob/master/LICENSE">licencia GNU General&nbsp;Public&nbsp;License&nbsp;v3.0</a>