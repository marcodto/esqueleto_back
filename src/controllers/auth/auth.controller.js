const { of } = require('await-of');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { User, Role } = require('../../models');
const redis = require('../../utils/redis');
const { sendVerificationEmail } = require('../../utils/mailer');

const verifyAsync = promisify(jwt.verify);
const { SESSION_SECRET, REDIS_PREFIX } = process.env;

// Helper para generar código de 6 dígitos
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─────────────────────────────────────────
// POST /auth/register
// ─────────────────────────────────────────
exports.register = async (ctx) => {
  const { first_name, last_name, email, password, role, phone, city, state } =
    ctx.request.body;

  // 1. Debe venir email o phone, no ambos ni ninguno
  if (!email && !phone) {
    return ctx.send(400, {
      success: false,
      message: 'Debes proporcionar un email o un número de teléfono.',
    });
  }

  if (email && phone) {
    return ctx.send(400, {
      success: false,
      message: 'Debes registrarte solo con email o solo con teléfono, no ambos.',
    });
  }

  // 2. Verificar duplicado según el método elegido
  if (email) {
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      return ctx.send(409, {
        success: false,
        message: 'Ya existe una cuenta con ese email.',
      });
    }
  }

  if (phone) {
    const phoneExists = await User.findOne({ where: { phone } });
    if (phoneExists) {
      return ctx.send(409, {
        success: false,
        message: 'Ya existe una cuenta con ese número de teléfono.',
      });
    }
  }

  // 3. Buscar rol por ID
  const roleRecord = await Role.findByPk(role);
  if (!roleRecord) {
    return ctx.send(400, {
      success: false,
      message: 'El rol especificado no existe. Usa 1 (coach) o 2 (client).',
    });
  }

  // 4. Hashear contraseña
  const password_hash = await bcrypt.hash(password, 10);

  // 5. Crear usuario
  const [newUser, err] = await of(
    User.create({
      first_name,
      last_name,
      email:     email || null,
      phone:     phone || null,
      city:      city  || null,
      state:     state || null,
      password_hash,
      role_id:   roleRecord.id,
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

  // 6. Generar código y guardar en Redis (15 minutos)
  const code = generateCode();
  await redis.setex(`${REDIS_PREFIX}verify_${newUser.id}`, 900, code);

  // 7. Enviar código según método elegido
  if (email) {
    await sendVerificationEmail(email, first_name, code);
    return ctx.ok({
      success: true,
      message: 'Registro exitoso. Revisa tu email para verificar tu cuenta.',
    });
  }

  if (phone) {
    // 📱 SMS pendiente de implementar (Twilio u otro servicio)
    console.log(`[DEV] Código de verificación para ${phone}: ${code}`);
    return ctx.ok({
      success: true,
      message: 'Registro exitoso. En breve recibirás un SMS con tu código de verificación.',
    });
  }
};

// ─────────────────────────────────────────
// POST /auth/verify
// ─────────────────────────────────────────
exports.verifyAccount = async (ctx) => {
  const { email, phone, code } = ctx.request.body;

  if (!email && !phone) {
    return ctx.send(400, {
      success: false,
      message: 'Debes proporcionar un email o un número de teléfono.',
    });
  }

  // Buscar usuario por email o phone
  const where = email ? { email } : { phone };
  const user = await User.findOne({ where });

  if (!user) {
    return ctx.notFound({
      success: false,
      message: 'No se encontró una cuenta con ese dato.',
    });
  }

  if (user.is_active) {
    return ctx.send(400, {
      success: false,
      message: 'Esta cuenta ya está verificada.',
    });
  }

  // Obtener código de Redis
  const savedCode = await redis.get(`${REDIS_PREFIX}verify_${user.id}`);
  if (!savedCode) {
    return ctx.send(400, {
      success: false,
      message: 'El código expiró. Solicita uno nuevo.',
    });
  }

  if (code !== savedCode) {
    return ctx.send(400, {
      success: false,
      message: 'El código es incorrecto.',
    });
  }

  // Activar cuenta y borrar código de Redis
  await Promise.all([
    user.update({ is_active: true }),
    redis.del(`${REDIS_PREFIX}verify_${user.id}`),
  ]);

  return ctx.ok({
    success: true,
    message: 'Cuenta verificada correctamente. Ya puedes iniciar sesión.',
  });
};

// ─────────────────────────────────────────
// POST /auth/resend-code
// ─────────────────────────────────────────
exports.resendCode = async (ctx) => {
  const { email, phone } = ctx.request.body;

  if (!email && !phone) {
    return ctx.send(400, {
      success: false,
      message: 'Debes proporcionar un email o un número de teléfono.',
    });
  }

  const where = email ? { email } : { phone };
  const user = await User.findOne({ where });

  if (!user) {
    return ctx.notFound({
      success: false,
      message: 'No se encontró una cuenta con ese dato.',
    });
  }

  if (user.is_active) {
    return ctx.send(400, {
      success: false,
      message: 'Esta cuenta ya está verificada.',
    });
  }

  // Generar nuevo código y sobreescribir en Redis
  const code = generateCode();
  await redis.setex(`${REDIS_PREFIX}verify_${user.id}`, 900, code);

  if (email) {
    await sendVerificationEmail(email, user.first_name, code);
    return ctx.ok({
      success: true,
      message: 'Se envió un nuevo código a tu email.',
    });
  }

  if (phone) {
    console.log(`[DEV] Nuevo código para ${phone}: ${code}`);
    return ctx.ok({
      success: true,
      message: 'En breve recibirás un nuevo SMS con tu código.',
    });
  }
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
      message: 'Tu cuenta no está verificada. Revisa tu email.',
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
      id:         user.id,
      email:      user.email,
      first_name: user.first_name,
      last_name:  user.last_name,
      role:       user.role.name,
      type:       'normal',
    },
    SESSION_SECRET,
    { expiresIn: '1day' },
  );

  return ctx.ok({
    success: true,
    message: 'Inicio de sesión exitoso.',
    user: {
      first_name: user.first_name,
      last_name:  user.last_name,
      email:      user.email,
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
      id:         user.id,
      email:      user.email,
      first_name: user.first_name,
      last_name:  user.last_name,
      role:       user.role.name,
      type:       'normal',
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