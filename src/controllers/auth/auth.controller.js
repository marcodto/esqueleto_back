const { of } = require('await-of');
const redis = require('../../utils/redis');
const Sequelize = require('sequelize');
const path = require('path');
const jwt = require('jsonwebtoken');
const handlebars = require('handlebars');
const { promisify } = require('util');
const moment = require('moment-timezone');
const {
  Usuarios,
  UsuariosMeta,
  sequelize,
  Sequelize: { Op },
} = require('../../models');
//const uuidv4 = require('uuid/v4');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const { createCode } = require('../../utils/auth');
const verifyAsync = promisify(jwt.verify);


const { auth } = require('google-auth-library');

const { REDIS_PREFIX, SESSION_SECRET } = process.env;

exports.getToken = async (ctx) => {
  const { user, password } = ctx.request.body;

  const usuarioExists = await Usuarios.findOne({ where: { usuario: user } });
  if (!usuarioExists) {
    return ctx.notFound({
      type: 'Auth/BadUserOrPassword',
      message: 'El usuario o contraseña son invalidos',
    });
  }

  const passwordValid = await usuarioExists.comparePassword(password);
  if (!passwordValid) {
    return ctx.notFound({
      type: 'Auth/BadUserOrPassword',
      message: 'El usuatio y contraseña son invalidos',
    });
  }
  console.log("test")
  console.log(usuarioExists)

  const uid = uuidv4();
  const token = jwt.sign(
    {
      id: usuarioExists.usuario_id,
      usuario: usuarioExists.usuario,
      nombre: usuarioExists.nombre,
      apellido: usuarioExists.apellido,
      refreshToken: uid,
      type: 'normal',
    },
    SESSION_SECRET,
    {
      expiresIn: '1day',
    },
  );

  return ctx.ok({ token: token });
};


exports.changePassword = async (ctx) => {
  const { password, code, email } = ctx.request.body;

  const usuario = await Usuarios.findOne({ where: { email } });

  if (!usuario) {
    return ctx.notFound({
      type: 'Auth/ClientNotFound',
      message: 'El usuario con este correo electrónico no fue encontrado.',
    });
  }

  const verifyCode = await redis.get(
    `${REDIS_PREFIX}reset_password_${usuario.usuario_id}`,
  );
  if (!verifyCode) {
    return ctx.notFound({
      type: 'Auth/ClientCodeNotFound',
      message: 'No se encontró ningún código de reinicio con ese correo electrónico. Solicite uno nuevo.',
    });
  }

  if (code !== verifyCode) {
    await redis.del(`${REDIS_PREFIX}reset_password_${usuario.usuario_id}`);
    return ctx.notFound({
      type: 'Auth/ClientCodeNotCorrect',
      message: 'El código registrado es incorrecto. Solicite uno nuevo.',
    });
  }

  await Promise.all([
    usuario.update({
      password,
    }),
    UsuariosMeta.destroy({
      where: {
        usuario_id: usuario.usuario_id,
        key: 'reset_password',
      },
    }),
  ]);

  return ctx.ok({
    success: true,
  });
};

exports.refreshToken = async (ctx) => {
  const { authorization } = ctx.header;
  console.log('token: ', authorization);

  if (!authorization) {
    return ctx.badRequest({
      type: 'Auth/InvalidToken',
      message: 'Token invalido',
    });
  }
  const [, token] = authorization.split(' ');
  console.log('token 2: ', token);
  if (!token) {
    return ctx.badRequest({
      type: 'Auth/NoTokenSend',
      message: 'No enviaste un token.',
    });
  }
  const [decode, err] = await of(
    verifyAsync(token, SESSION_SECRET, {
      ignoreExpiration: true,
    }),
  );
  if (err) {
    return ctx.badRequest({
      error: true,
      type: 'Auth/InvalidToken',
      message: 'Token invalido',
    });
  }
  const usuario = await Usuarios.findByPk(decode.id);
  if (!usuario) {
    return ctx.notFound({
      error: true,
      type: 'Auth/AccountNotFound',
      message: 'El usuario no existe.',
    });
  }

  const uid = uuidv4();
  const newtoken = jwt.sign(
    {
      id: usuario.usuario_id,
      usuario: usuario.usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      refreshToken: uid,
      type: 'normal',
    },
    SESSION_SECRET,
    {
      expiresIn: '1day',
    },
  );
  return ctx.ok({ token: newtoken });
};
