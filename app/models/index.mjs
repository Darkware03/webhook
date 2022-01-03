import DB from "../nucleo/DB.mjs";
import Usuario from "./Usuario.mjs";
import RefreshToken from "./RefreshToken.mjs";
import Perfil from "./Perfil.mjs";
import PerfilRol from "./PerfilRol.mjs";
import Rol from "./Rol.mjs";
import Ruta from "./Ruta.mjs";
import RutaRol from "./RutaRol.mjs";
import UsuarioPerfil from "./UsuarioPerfil.mjs";
import UsuarioRol from "./UsuarioRol.mjs";


RefreshToken.belongsTo(Usuario, {
    foreignKey: 'id_usuario'
})

Usuario.hasMany(RefreshToken, {
    foreignKey: 'id_usuario'
})

Usuario.belongsToMany(Perfil, {
    through: UsuarioPerfil, 
    foreignKey: "id_usuario",
    otherKey: 'id_perfil'
})
Usuario.belongsToMany(Rol, {
    through: UsuarioRol, 
    foreignKey: "id_usuario",
    otherKey: 'id_rol'
})
Perfil.belongsToMany(Usuario, {
    through: UsuarioPerfil, 
    foreignKey: "id_perfil",
    otherKey: 'id_usuario'
})
Perfil.belongsToMany(Rol, {
    through: PerfilRol, 
    foreignKey: "id_perfil",
    otherKey: 'id_rol'
})

Rol.belongsToMany(Perfil, {
    through: PerfilRol, 
    foreignKey: "id_rol",
    otherKey: 'id_perfil'
})

Rol.belongsToMany(Ruta, {
    through: RutaRol, 
    foreignKey: "id_rol",
    otherKey: 'id_ruta'
})

Rol.belongsToMany(Usuario, {
    through: UsuarioRol, 
    foreignKey: "id_rol",
    otherKey: 'id_usuario'
})

Ruta.belongsToMany(Rol, {
    through: RutaRol, 
    foreignKey: "id_ruta",
    otherKey: 'id_rol'
})

PerfilRol.sync({})
RefreshToken.sync()
Perfil.sync({})
Ruta.sync({}); 
RutaRol.sync();
Usuario.sync({})
UsuarioPerfil.sync({});
UsuarioRol.sync({}); 
Ruta.sync()
DB.connection().sync()

export {
    RefreshToken, 
    Usuario,
    Perfil,
    PerfilRol,
    Rol,
    Ruta,
    RutaRol,
    UsuarioPerfil,
    UsuarioRol
}