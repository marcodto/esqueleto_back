const joi = require('joi');
const CtrlAuth = require('./auth.controller');
const validate = require('../../middlewares/validate.middleware');

module.exports = (Router) => {
  const router = new Router({
    prefix: '/auth',
  });

  /**
   * @api {post} /auth/register Registro de usuario
   * @apiName register
   * @apiGroup Auth
   *
   * @apiBody {String} first_name  Nombre del usuario.
   * @apiBody {String} last_name   Apellido del usuario.
   * @apiBody {String} email       Email del usuario.
   * @apiBody {String} password    Contraseña (mínimo 6 caracteres).
   * @apiBody {Number} role        ID del rol: 1 (coach) o 2 (client).
   * @apiBody {String} [phone]     Teléfono (opcional).
   * @apiBody {String} [city]      Ciudad (opcional).
   * @apiBody {String} [state]     Estado (opcional).
   *
   * @apiParamExample {json} Input:
   * {
   *   "first_name": "Carlos",
   *   "last_name": "Ruiz",
   *   "email": "carlos@gmail.com",
   *   "password": "123456",
   *   "role": 1
   * }
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "token": "eyJhbGci...",
   *   "user": {
   *     "id": 1,
   *     "first_name": "Carlos",
   *     "last_name": "Ruiz",
   *     "email": "carlos@gmail.com",
   *     "role": "coach"
   *   }
   * }
   */
  router.post(
    '/register',
    validate({
      body: {
        first_name: joi.string().trim().required(),
        last_name:  joi.string().trim().required(),
        email:      joi.string().trim().email().required(),
        password:   joi.string().trim().min(6).required(),
        role:       joi.number().integer().valid(1, 2).required(),
        phone:      joi.string().trim().optional().allow(null, ''),
        city:       joi.string().trim().optional().allow(null, ''),
        state:      joi.string().trim().optional().allow(null, ''),
      },
    }),
    CtrlAuth.register,
  );

  /**
   * @api {post} /auth/login Login
   * @apiName login
   * @apiGroup Auth
   *
   * @apiBody {String} email    Email del usuario.
   * @apiBody {String} password Contraseña del usuario.
   *
   * @apiParamExample {json} Input:
   * {
   *   "email": "carlos@gmail.com",
   *   "password": "123456"
   * }
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "token": "eyJhbGci...",
   *   "user": {
   *     "id": 1,
   *     "first_name": "Carlos",
   *     "last_name": "Ruiz",
   *     "email": "carlos@gmail.com",
   *     "role": "coach"
   *   }
   * }
   */
  router.post(
    '/login',
    validate({
      body: {
        email:    joi.string().trim().email().required(),
        password: joi.string().trim().required(),
      },
    }),
    CtrlAuth.login,
  );

  /**
   * @api {get} /auth/refreshToken Refrescar token
   * @apiName refreshToken
   * @apiGroup Auth
   *
   * @apiHeader {String} authorization Bearer token.
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * { "token": "eyJhbGci..." }
   */
  router.get(
    '/refreshToken',
    validate({
      header: {
        authorization: joi.string().trim().required(),
      },
    }),
    CtrlAuth.refreshToken,
  );

  return router;
};