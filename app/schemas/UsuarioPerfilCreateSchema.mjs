export const usuarioPerfilCreateSchema={
    type:'object',
    properties:{
        id:{
            type:'number',
            required:true
        },
        id_perfil:{
            type:'number',
        },
        id_usuario:{
            type:'number',
        },
    }
}