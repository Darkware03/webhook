import Usuario from "./Usuario.mjs";
import RefreshToken from "./RefreshToken.mjs";

RefreshToken.belongsTo(Usuario, {
    foreignKey: 'id_usuario'
})

Usuario.hasMany(RefreshToken, {
    foreignKey: 'id_usuario'
})

export {
    RefreshToken, Usuario
}