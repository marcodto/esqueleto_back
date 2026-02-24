const Sequelize = require('sequelize');

class UsuariosMeta extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT,
        },
        usuario_id: {
          type: Sequelize.BIGINT.UNSIGNED,
          references: {
            model: 'Usuarios',
            key: 'usuario_id',
          },
        },
        key: {
          type: Sequelize.STRING,
        },
        value: {
          type: Sequelize.STRING,
        },
      },
      {
        sequelize,
        tableName: 'UsuariosMeta',
        /*defaultScope: {
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },*/
      },
    );
  }

  static associate(models) {
    UsuariosMeta.belongsTo(models.Usuarios, {
      foreignKey: 'usuario_id',
      targetKey: 'usuario_id',
      as: 'Usuarios',
    });
  }
}

module.exports = UsuariosMeta;
