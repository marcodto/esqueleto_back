const { of } = require('await-of');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { User, Role } = require('../../models');

const verifyAsync = promisify(jwt.verify);
const { SESSION_SECRET } = process.env;

// ─────────────────────────────────────────
// POST /auth/register
// ─────────────────────────────────────────
exports.register = async (ctx) => {
  const { first_name, last_name, email, password, role, phone, city, state } =
    ctx.request.body;

  const emailExists = await User.findOne({ where: { email } });
  if (emailExists) {
    return ctx.send(409, {
      success: false,
      message: 'Ya existe una cuenta con ese email.',
    });
  }

  const roleRecord = await Role.findByPk(role);
  if (!roleRecord) {
    return ctx.send(400, {
      success: false,
      message: 'El rol especificado no existe. Usa 1 (coach) o 2 (client).',
    });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const [newUser, err] = await of(
    User.create({
      first_name,
      last_name,
      email,
      password_hash,
      phone: phone || null,
      city: city || null,
      state: state || null,
      role_id: roleRecord.id,
      is_active: false,
      createdAt: Sequelize.fn('now'),
      updatedAt: Sequelize.fn('now'),
    }),
  );

  if (err) {
    console.error(err);
    return ctx.badRequest({
      success: false,
      message: 'Hubo un problema al crear la cuenta.',
    });
  }

  const token = jwt.sign(
    {
      id: newUser.id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      role: roleRecord.name,
      type: 'normal',
    },
    SESSION_SECRET,
    { expiresIn: '1day' },
  );

  return ctx.ok({
    success: true,
    message: 'Usuario registrado correctamente.',
  });
};

// ─────────────────────────────────────────
// POST /auth/login
// ─────────────────────────────────────────
exports.login = async (ctx) => {
  const { email, password } = ctx.request.body;

  const user = await User.findOne({
    where: { email },
    include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
  });

  if (!user) {
    return ctx.notFound({
      success: false,
      message: 'El email o contraseña son inválidos.',
    });
  }

  if (!user.is_active) {
    return ctx.send(403, {
      success: false,
      message: 'Tu cuenta está desactivada. Contacta al administrador.',
    });
  }

  const passwordValid = await bcrypt.compare(password, user.password_hash);
  if (!passwordValid) {
    return ctx.notFound({
      success: false,
      message: 'El email o contraseña son inválidos.',
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role.name,
      type: 'normal',
    },
    SESSION_SECRET,
    { expiresIn: '1day' },
  );

  return ctx.ok({
    success: true,
    message: 'Inicio de sesión exitoso.',
    user: {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    },
    token,
  });
};

// ─────────────────────────────────────────
// GET /auth/refreshToken
// ─────────────────────────────────────────
exports.refreshToken = async (ctx) => {
  const { authorization } = ctx.header;

  if (!authorization) {
    return ctx.badRequest({
      success: false,
      message: 'Token inválido.',
    });
  }

  const [, token] = authorization.split(' ');
  if (!token) {
    return ctx.badRequest({
      success: false,
      message: 'No enviaste un token.',
    });
  }

  const [decode, err] = await of(
    verifyAsync(token, SESSION_SECRET, { ignoreExpiration: true }),
  );

  if (err) {
    return ctx.badRequest({
      success: false,
      message: 'Token inválido.',
    });
  }

  const user = await User.findByPk(decode.id, {
    include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
  });

  if (!user) {
    return ctx.notFound({
      success: false,
      message: 'El usuario no existe.',
    });
  }

  const newToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role.name,
      type: 'normal',
    },
    SESSION_SECRET,
    { expiresIn: '1day' },
  );

  return ctx.ok({
    success: true,
    message: 'Token renovado correctamente.',
    token: newToken,
  });
};
