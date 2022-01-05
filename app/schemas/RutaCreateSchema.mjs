export const rutaCreateSchema={
    type:'object',
    properties:{
        nombre:{
            type:'string',
            required: true
        },
        uri:{
            type:'string',
        },
        nombre_uri:{
            type:'string',
        },
        mostrar:{
            type:'boolean',
            required: true
        },
        icono:{
            type:'string',
        },
        orden:{
            type:'number',
        },
        publico:{
            type:'boolean',
        },
        id_ruta_padre:{
            type:'number',
        },
    }
}