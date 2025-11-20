
export default (sequelize, DataTypes) => {
  const Link = sequelize.define("Link", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(8),
      unique: true,
      allowNull: false
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    total_clicks: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    last_clicked: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  return Link;
};
