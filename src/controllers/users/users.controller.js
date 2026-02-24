const {
  Usuarios,
  sequelize,
  Sequelize: { Op },
} = require('../../models');
const { of } = require('await-of');
const Sequelize = require('sequelize');
const { filterByQuery, parseOrder } = require('../../utils/request');

const { join } = require('path');
const { promisify } = require('util');
const fs = require('fs');
const mv = require('mv');
const moveAsync = promisify(mv);
const { access, mkdir } = fs.promises;

// const axios = require('axios');

const server_name = String(process.env.SERVER_NAME);

exports.addUsuario = async (ctx, next) => {
  let user = undefined;
  console.log(ctx.request.body);
  const {
    nombre,
    apellido,
    usuario,
    email,
    password,
    telefono = null,
    direccion = null,
    estado = null,
    ciudad = null,
    codigo_postal = null,
    cantidad_invitados = null,
    es_admin
  } = ctx.request.body;


  const usuarioExists = await Usuarios.findOne({
    where: {
      usuario: usuario,
    },
  });

  if (usuarioExists) {
    return ctx.send(409, {
      type: 'Usuario/usuarioExiste',
      message: 'Un existe una persona con ese usuario.',
    });
  }

  const [res, err] = await of(
    Usuarios.create({
      nombre: nombre,
      apellido: apellido,
      usuario: usuario,
      email: email,
      password: password,
      telefono: telefono,
      direccion: direccion,
      estado: estado,
      ciudad: ciudad,
      codigo_postal: codigo_postal,
      es_admin: es_admin,
      estatus: true,
      cantidad_invitados:cantidad_invitados,
      createdAt: Sequelize.fn('now'),
      updatedAt: Sequelize.fn('now'),
    }),
  );
  if (!err) {
    console.log('Agregando Usuario: ', res);
    user = res.dataValues;
  } else {
    return ctx.badRequest({
      type: 'Usuarios/Error',
      message: 'Problemas al agregar usuario.',
    });
  }



  ctx.params.id = user.usuario_id;
  return next();
};

exports.getUsuario = async (ctx) => {
  const { id } = ctx.params;
  const usuario = await Usuarios.findByPk(id, {
    attributes: {
      exclude: ['password'],
    },
    include: [
     
    ],
  });
  if (!user) {
    return ctx.notFound({
      type: 'Usuario/NoEncontrado',
      message: 'No se encontro usuario con ese identificador.',
    });
  }
  return ctx.ok(user);
};


exports.getUsuarios = async (ctx) => {
  let { limit, page, order, search , status} = ctx.query;
  const where = {
    ...filterByQuery(Object.keys(Usuarios.rawAttributes), ctx.query),
  };

  if (!limit || page > 100) {
     limit = 10;
   }
  if (!page) {
    page = 1;
  }
  if (search) {
    where[Op.or] = [
      { nombre: { [Op.like]: `%${search}%` } },
      { apellido: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { usuario: { [Op.like]: `%${search}%` } },
    ];
  }
 
/*   var val = (status === "true");
  where[Op.and] = [
    { estatus:  val },
  ]; */
  if (!order) {
    order = 'usuario_id,asc';
  } else {
    order = 'usuario_id,' + order;
  }

  const orderBy = parseOrder(Object.keys(Usuarios.rawAttributes), order);

  const [count, rows] = await Promise.all([
    Usuarios.count(),
    Usuarios.findAll({
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt'],
      },
      where,
      include: [],
      limit: limit && parseInt(limit, 10),
      offset: limit && parseInt(limit, 10) * (parseInt(page, 10) - 1),
      order: orderBy,
    }),
  ]);
  return ctx.ok({
    count,
    rows,
  });
};


exports.updateUsuario = async (ctx, next) => {
  const { id } = ctx.params;
  const user = await Usuarios.findByPk(id);
  if (!user) {
    return ctx.notFound({
      type: 'Usuario/NoEncontrado',
      message: 'No se encontro al usuario con ese identificador.',
    });
  }
  const {
    nombre,
      apellido,
      usuario,
      email,
      password,
      telefono,
      direccion,
      estado,
      ciudad,
      codigo_postal,
      es_admin,
      estatus
  } = ctx.request.body;


  if (usuario) {
    const usuarioExists = await Usuarios.findOne({ where: { usuario } });
    if (usuarioExists && usuarioExists.user_id !== user.user_id) {
      return ctx.send(409, {
        type: 'Usuario/usuarioExists',
        message: 'A user with this usuario already exists.',
      });
    }
  }

  await user.update(
    {
      nombre: nombre,
      apellido: apellido,
      usuario: usuario,
      email: email,
      password: password,
      telefono: telefono,
      direccion: direccion,
      estado: estado,
      ciudad: ciudad,
      codigo_postal: codigo_postal,
      es_admin: es_admin,
      estatus: estatus,
    },
    {
      where: {
        usuario_id: user.usuario_id,
      },
    },
  );

  return next();
};

exports.activateUsuario = async (ctx) => {
  const { id } = ctx.params;
  const user = await Usuarios.findByPk(id);
  if (!user) {
    return ctx.notFound({
      type: 'User/NoEncontrado',
      message: 'No se encontro al usuario con ese identificador.',
    });
  }
  let activo;

  if (user.estatus == true) {
    activo = false;
  } else {
    activo = true;
  }

  await user.update({ estatus: activo }, { where: { usuario_id: user.usuario_id } });

  return ctx.ok({ success: true });
};
