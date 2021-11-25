import DB from "../nucleo/DB.mjs";
import {Sequelize} from "sequelize";

const Usuario=DB.conection().define('usuario',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    first_name:{
        type:Sequelize.TEXT
    },
    last_name:{
        type:Sequelize.TEXT
    }
},{
    timestamps:false,
})

export default Usuario