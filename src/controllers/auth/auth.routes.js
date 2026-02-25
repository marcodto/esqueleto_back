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
   * @apiBody {String} first_name       Nombre del usuario.
   * @apiBody {String} last_name        Apellido del usuario.
   * @apiBody {String} password         Contraseña (mínimo 6 caracteres).
   * @apiBody {Number} role             ID del rol: 1 (coach) o 2 (client).
   * @apiBody {String} [email]          Email del usuario (requerido si no se manda phone).
   * @apiBody {String} [phone]          Teléfono (requerido si no se manda email).
   * @apiBody {String} [city]           Ciudad (opcional).
   * @apiBody {String} [state]          Estado (opcional).
   *
   * @apiParamExample {json} Registro con email:
   * {
   *   "first_name": "Carlos",
   *   "last_name": "Ruiz",
   *   "email": "carlos@gmail.com",
   *   "password": "123456",
   *   "role": 1
   * }
   *
   * @apiParamExample {json} Registro con teléfono:
   * {
   *   "first_name": "Carlos",
   *   "last_name": "Ruiz",
   *   "phone": "6641234567",
   *   "password": "123456",
   *   "role": 1
   * }
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "success": true,
   *   "message": "Registro exitoso. Revisa tu email para verificar tu cuenta."
   * }
   *
   * @apiErrorExample {json} Email duplicado:
   * HTTP/1.1 409 Conflict
   * {
   *   "success": false,
   *   "message": "Ya existe una cuenta con ese email."
   * }
   *
   * @apiErrorExample {json} Rol inválido:
   * HTTP/1.1 400 Bad Request
   * {
   *   "success": false,
   *   "message": "El rol especificado no existe. Usa 1 (coach) o 2 (client)."
   * }
   */
  router.post(
    '/register',
    validate({
      body: {
        first_name: joi.string().trim().required(),
        last_name:  joi.string().trim().required(),
        password:   joi.string().trim().min(6).required(),
        role:       joi.number().integer().valid(1, 2).required(),
        email:      joi.string().trim().email().optional(),
        phone:      joi.string().trim().optional(),
        city:       joi.string().trim().optional().allow(null, ''),
        state:      joi.string().trim().optional().allow(null, ''),
      },
    }),
    CtrlAuth.register,
  );

  /**
   * @api {post} /auth/verify Verificar cuenta
   * @apiName verifyAccount
   * @apiGroup Auth
   *
   * @apiBody {String} code           Código de 6 dígitos recibido por email o SMS.
   * @apiBody {String} [email]        Email del usuario (si se registró con email).
   * @apiBody {String} [phone]        Teléfono del usuario (si se registró con teléfono).
   *
   * @apiParamExample {json} Verificar con email:
   * {
   *   "email": "carlos@gmail.com",
   *   "code": "483920"
   * }
   *
   * @apiParamExample {json} Verificar con teléfono:
   * {
   *   "phone": "6641234567",
   *   "code": "483920"
   * }
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "success": true,
   *   "message": "Cuenta verificada correctamente. Ya puedes iniciar sesión."
   * }
   *
   * @apiErrorExample {json} Código expirado:
   * HTTP/1.1 400 Bad Request
   * {
   *   "success": false,
   *   "message": "El código expiró. Solicita uno nuevo."
   * }
   *
   * @apiErrorExample {json} Código incorrecto:
   * HTTP/1.1 400 Bad Request
   * {
   *   "success": false,
   *   "message": "El código es incorrecto."
   * }
   */
  router.post(
    '/verify',
    validate({
      body: {
        code:  joi.string().trim().length(6).required(),
        email: joi.string().trim().email().optional(),
        phone: joi.string().trim().optional(),
      },
    }),
    CtrlAuth.verifyAccount,
  );

  /**
   * @api {post} /auth/resend-code Reenviar código de verificación
   * @apiName resendCode
   * @apiGroup Auth
   *
   * @apiBody {String} [email]   Email del usuario (si se registró con email).
   * @apiBody {String} [phone]   Teléfono del usuario (si se registró con teléfono).
   *
   * @apiParamExample {json} Reenviar por email:
   * {
   *   "email": "carlos@gmail.com"
   * }
   *
   * @apiParamExample {json} Reenviar por teléfono:
   * {
   *   "phone": "6641234567"
   * }
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "success": true,
   *   "message": "Se envió un nuevo código a tu email."
   * }
   *
   * @apiErrorExample {json} Cuenta ya verificada:
   * HTTP/1.1 400 Bad Request
   * {
   *   "success": false,
   *   "message": "Esta cuenta ya está verificada."
   * }
   */
  router.post(
    '/resend-code',
    validate({
      body: {
        email: joi.string().trim().email().optional(),
        phone: joi.string().trim().optional(),
      },
    }),
    CtrlAuth.resendCode,
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
   *   "success": true,
   *   "message": "Inicio de sesión exitoso.",
   *   "user": {
   *     "first_name": "Carlos",
   *     "last_name": "Ruiz",
   *     "email": "carlos@gmail.com"
   *   },
   *   "token": "eyJhbGci..."
   * }
   *
   * @apiErrorExample {json} Credenciales inválidas:
   * HTTP/1.1 404 Not Found
   * {
   *   "success": false,
   *   "message": "El email o contraseña son inválidos."
   * }
   *
   * @apiErrorExample {json} Cuenta no verificada:
   * HTTP/1.1 403 Forbidden
   * {
   *   "success": false,
   *   "message": "Tu cuenta no está verificada. Revisa tu email."
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
   * {
   *   "success": true,
   *   "message": "Token renovado correctamente.",
   *   "token": "eyJhbGci..."
   * }
   *
   * @apiErrorExample {json} Token inválido:
   * HTTP/1.1 400 Bad Request
   * {
   *   "success": false,
   *   "message": "Token inválido."
   * }
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