export const usuarioCreateSchema={
    type:'object',
    properties:{
        name:{
            type:'string',
            required:true
        },
        last_name:{
            type:'string',
            required:true
        },
        password:{
            type:'string',
            required:true
        },
        email:{
            type:'string',
            required:true
        }
    }
}