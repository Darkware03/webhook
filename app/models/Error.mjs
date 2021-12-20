import DB from "../nucleo/DB.mjs";
import psql from "sequelize";

class Bitacora extends psql.Model {}

Bitacora.init(
  {
    id: {
      type: psql.Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_bitacora: {
      type: psql.Sequelize.INTEGER,
    },
    codigo: {
      type: psql.Sequelize.INTEGER,
    },
    mensaje: {
      type: psql.Sequelize.TEXT,
    },
    trace: {
      type: psql.Sequelize.TEXT,
    },
    fecha_hora_reg: {
      type: psql.Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    updatedAt: false,
    sequelize: DB.connection(),
    tableName: "bt_bitacora",
  }
);

export default Error;
