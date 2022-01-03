import Usuario from "./Usuario.mjs";
import RefreshToken from "./RefreshToken.mjs";
import DB from "../nucleo/DB.mjs";


RefreshToken.belongsTo(Usuario, {
    foreignKey: 'id_usuario'
})

Usuario.hasMany(RefreshToken, {
    foreignKey: 'id_usuario'
})
await Usuario.sync()
await RefreshToken.sync()
await DB.connection().sync()
export {
    RefreshToken, Usuario
}