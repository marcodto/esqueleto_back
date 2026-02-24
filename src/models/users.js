const Sequelize = require('sequelize');

const { hashSaltAsync, compareAsync } = require('../utils/bcrypt');

class Usuarios extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        usuario_id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT,
        },
        nombre: {
          type: Sequelize.STRING,
        },
        apellido: {
          type: Sequelize.STRING,
        },
        usuario: {
          type: Sequelize.STRING,
          unique: true,
        },
        email: {
          type: Sequelize.STRING,
        },
        telefono: {
          allowNull: true,
          type: Sequelize.STRING(13),
        },
        password: {
          type: Sequelize.STRING(100),
        },
        direccion: {
          allowNull: true,
          type: Sequelize.STRING,
        },
        estado: {
          allowNull: true,
          type: Sequelize.STRING,
        },
        ciudad: {
          allowNull: true,
          type: Sequelize.STRING,
        },
        codigo_postal: {
          allowNull: true,
          type: Sequelize.STRING,
        },
        estatus: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        es_admin: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },        
        cantidad_invitados: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        }
      },
      {
        sequelize,
        tableName: 'Usuarios',
        hooks: {
          beforeCreate: async function onCreate(usuario) {
            if (usuario.password) {
              const hash = await hashSaltAsync(usuario.password);
              usuario.password = hash;
            }
          },
          beforeUpdate: async function onChange(usuario) {
            if (usuario.changed('password') && usuario.password) {
              const hash = await hashSaltAsync(usuario.password);
              usuario.password = hash;
            }
          },
        },
        defaultScope: {
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
      },
    );
  }

  checkUsername = async (usuario) => {
    const result = await user.findOne({
      where: {
        usuario,
      },
    });
    return result;
  };

  comparePassword(usuarioPassword) {
    return compareAsync(usuarioPassword, this.password);
  }

  static associate(models) {
  }
}

module.exports = Usuarios;
