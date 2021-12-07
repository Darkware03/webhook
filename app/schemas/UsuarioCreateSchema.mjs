export const usuarioCreateSchema={
    type:'object',
    properties:{
        name:{
            type:'string'
        },
        last_name:{
            type:'string'
        },
        password:{
            type:'string'
        },
        email:{
            type:'string'
        }
    }
}