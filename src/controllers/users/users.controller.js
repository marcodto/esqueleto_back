const { User, Role } = require('../../models');
const { of } = require('await-of');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const { filterByQuery, parseOrder } = require('../../utils/request');
const bcrypt = require('bcrypt');

// ─────────────────────────────────────────
// POST /usuarios
// ─────────────────────────────────────────
exports.addUsuario = async (ctx, next) => {
  const { name, email, password, role } = ctx.request.body;

  // 1. Verificar email duplicado
  const emailExists = await User.findOne({ where: { email } });
  if (emailExists) {
    return ctx.send(409, {
      type: 'User/EmailExiste',
      message: 'Ya existe un usuario con ese email.',
    });
  }

  // 2. Buscar el rol en la tabla roles
  const roleRecord = await Role.findOne({ where: { name: role } });
  if (!roleRecord) {
    return ctx.send(400, {
      type: 'User/RolInvalido',
      message: 'El rol especificado no existe. Usa "coach" o "client".',
    });
  }

  // 3. Hashear contraseña
  const password_hash = await bcrypt.hash(password, 10);

  // 4. Crear usuario
  const [res, err] = await of(
    User.create({
      name,
      email,
      password_hash,
      role_id: roleRecord.id,
      createdAt: Sequelize.fn('now'),
      updatedAt: Sequelize.fn('now'),
    })
  );

  if (err) {
    return ctx.badRequest({
      type: 'User/ErrorCrear',
      message: 'Hubo un problema al crear el usuario.',
    });
  }

  ctx.params.id = res.id;
  return next();
};

// ─────────────────────────────────────────
// GET /usuarios/:id
// ─────────────────────────────────────────
exports.getUsuario = async (ctx) => {
  const { id } = ctx.params;

  const user = await User.findByPk(id, {
    attributes: { exclude: ['password_hash'] },
    include: [
      {
        model: Role,
        as: 'role',
        attributes: ['id', 'name', 'description'],
      },
    ],
  });

  if (!user) {
    return ctx.notFound({
      type: 'User/NoEncontrado',
      message: 'No se encontró usuario con ese identificador.',
    });
  }

  return ctx.ok(user);
};

// ─────────────────────────────────────────
// GET /usuarios
// ─────────────────────────────────────────
exports.getUsuarios = async (ctx) => {
  let { limit, page, order, search, role } = ctx.query;

  if (!limit || limit > 100) limit = 10;
  if (!page) page = 1;

  const where = {};

  // Filtro por búsqueda de texto
  if (search) {
    where[Op.or] = [
      { name:  { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  // Filtro por rol (ej: ?role=coach)
  const includeRole = {
    model: Role,
    as: 'role',
    attributes: ['id', 'name'],
  };

  if (role) {
    includeRole.where = { name: role };
  }

  if (!order) order = 'id,asc';
  const orderBy = parseOrder(Object.keys(User.rawAttributes), order);

  const [count, rows] = await Promise.all([
    User.count(),
    User.findAll({
      attributes: { exclude: ['password_hash'] },
      where,
      include: [includeRole],
      limit: parseInt(limit, 10),
      offset: parseInt(limit, 10) * (parseInt(page, 10) - 1),
      order: orderBy,
    }),
  ]);

  return ctx.ok({ count, rows });
};

// ─────────────────────────────────────────
// PUT /usuarios/:id
// ─────────────────────────────────────────
exports.updateUsuario = async (ctx, next) => {
  const { id } = ctx.params;

  const user = await User.findByPk(id);
  if (!user) {
    return ctx.notFound({
      type: 'User/NoEncontrado',
      message: 'No se encontró al usuario con ese identificador.',
    });
  }

  const { name, email, password, role } = ctx.request.body;
  const updateData = {};

  if (name)  updateData.name  = name;
  if (email) updateData.email = email;

  // Si viene password nueva, hashearla
  if (password) {
    updateData.password_hash = await bcrypt.hash(password, 10);
  }

  // Si viene rol, buscarlo y asignar role_id
  if (role) {
    const roleRecord = await Role.findOne({ where: { name: role } });
    if (!roleRecord) {
      return ctx.send(400, {
        type: 'User/RolInvalido',
        message: 'El rol especificado no existe. Usa "coach" o "client".',
      });
    }
    updateData.role_id = roleRecord.id;
  }

  // Verificar email duplicado si lo está cambiando
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      return ctx.send(409, {
        type: 'User/EmailExiste',
        message: 'Ya existe un usuario con ese email.',
      });
    }
  }

  updateData.updatedAt = Sequelize.fn('now');

  await user.update(updateData, { where: { id: user.id } });

  ctx.params.id = user.id;
  return next();
};

// ─────────────────────────────────────────
// PUT /usuarios/estatus/:id
// ─────────────────────────────────────────
exports.activateUsuario = async (ctx) => {
  const { id } = ctx.params;

  const user = await User.findByPk(id);
  if (!user) {
    return ctx.notFound({
      type: 'User/NoEncontrado',
      message: 'No se encontró al usuario con ese identificador.',
    });
  }

  const nuevoEstatus = !user.is_active;
  await user.update({ is_active: nuevoEstatus }, { where: { id: user.id } });

  return ctx.ok({ success: true, is_active: nuevoEstatus });
};