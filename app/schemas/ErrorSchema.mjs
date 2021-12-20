export const errorCreateSchema={
    type:'object',
    properties:{
        id:{
            type:'number',
            required:true
        },
        id_bitacora:{
            type:'number',
        },
        codigo:{
            type:'number',
        },
        mensaje:{
            type:'string',
        },
        trace:{
            type:'string',
        },
        fecha_hora_reg: {
            type:'date-time',
            required: true
        },
    }
}