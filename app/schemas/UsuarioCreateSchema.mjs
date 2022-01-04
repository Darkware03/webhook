export const usuarioCreateSchema={
    type:'object',
    properties:{
        password:{
            type:'string',
            required:true
        },
        email:{
            type:'string',
            required:true
        },
        perfiles: {
            type: 'array'
        },
        roles: {
            type: 'array'
        }
    }
}