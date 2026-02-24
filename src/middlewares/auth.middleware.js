const { of } = require('await-of');
const jwt = require('jsonwebtoken');
const redis = require('../utils/redis');
const Sequelize = require('sequelize');
const {
  Users,
  Drives,
  Sequelize: { Op },
} = require('../models');
const axios = require('axios');

module.exports = async function AuthMiddleware(ctx, next) {
  const { authorization } = ctx.headers;
  const [type, token] = authorization
    ? authorization.split(' ')
    : [undefined, undefined];

  /** *************************************** */
  /** Token Validations */
  /** *************************************** */
  // console.log(token);
  if (!token) {
    return ctx.badRequest({
      type: 'Auth/InvalidToken',
      message: 'Token invalid',
    });
  } else if (!type || type !== 'Bearer') {
    return ctx.badRequest({
      type: 'Auth/InvalidTokenType',
      message: 'Only bearer token is accepted.',
    });
  }

  const decode = jwt.decode(token, { header: true });
  //console.log('el valor de decode es:', decode);

  let user = undefined;
  // let role = !Array.isArray(decode.role) ? [decode.role] : decode.role;
  const user_id = decode.id;
  const role_id = decode.role;

  if (!user && decode.role === 'Administrador') {
    return ctx.badRequest({
      type: 'Auth/UserNotFound',
      message: 'El usuario no existe.',
    });
  }

  /** *************************************** */
  /** Return */
  /** *************************************** */
  // ctx.token = token;
  ctx.user = [user_id, role_id];
  //await redis.set(`users_${decode.uid}`, JSON.stringify(user), 'EX', 3600 * 24);
  return next();
};
