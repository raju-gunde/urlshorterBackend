import Sequelize from "sequelize";
import configFile from "../config/config.js";

const env = "development";
const config = configFile[env];

export const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

export const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
import Link from "./link.js";
db.Link = Link(sequelize, Sequelize);

export default db;
