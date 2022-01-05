import Usuario from "./Usuario.mjs";
import RefreshToken from "./RefreshToken.mjs";
import Perfil from "./Perfil.mjs";
import PerfilRol from "./PerfilRol.mjs";
import Rol from "./Rol.mjs";
import Ruta from "./Ruta.mjs";
import RutaRol from "./RutaRol.mjs";
import UsuarioPerfil from "./UsuarioPerfil.mjs";
import UsuarioRol from "./UsuarioRol.mjs";

Usuario.associate({Rol, UsuarioRol, RefreshToken, Perfil, UsuarioPerfil})
RefreshToken.associate({Usuario})
Perfil.associate({Usuario, UsuarioPerfil, Rol, PerfilRol})
Rol.associate({Ruta, RutaRol, Perfil, PerfilRol, UsuarioRol, Usuario})
Ruta.associate({RutaRol, Rol})

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