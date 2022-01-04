export const perfilCreateSchema={
    type:'object',
    properties:{
        id:{
            type:'number',
            required:true
        },
        nombre:{
            type:'string',
            required: true
        },
        codigo:{
            type:'string',
        },
    }
}