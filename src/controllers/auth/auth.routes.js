const joi = require('joi');
const CtrlAuth = require('./auth.controller');
const validate = require('../../middlewares/validate.middleware');

module.exports = (Router) => {
  const router = new Router({
    prefix: `/auth`,
  });

  /**
   * @api {post} /auth Login
   * @apiName GetToken
   * @apiGroup Auth
   *
   * @apiParam {String} usuario Nombre de usuario
   * @apiParam {String} password Contraseña del usuario
   *
   * @apiSuccess (200) {String} token JWT de autorización
   *
   * @apiError Auth/BadEmailOrPassword The email or password is invalid.
   *
   * @apiExample {json} Example usage:
   * {
   *    "user": "...",
   *    "password": "..."
   * }
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "token": "..."
   *     }
   *
   *
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 404 Not Found
   *     {
   *       "type": "Auth/BadEmailOrPassword",
   *       "message": "The email or password is invalid."
   *     }
   */
  router.post(
    '/',
    validate({
      body: {
        user: joi.string().required(),
        password: joi.string().required(),
      },
    }),
    CtrlAuth.getToken,
  );



  /**
   * @api {post} /auth/changePassword Cambiar contraseña
   * @apiName changePassword
   * @apiGroup Auth
   *
   * @apiParam {String} email Correo electrónico del usuario
   * @apiParam {String} code Código de verificación enviado al correo del usuario
   * @apiParam {String} password Nueva contraseña del usuario
   *
   * @apiExample {json} Example usage:
   * {
   *    "email": "...",
   *    "code": "...",
   *    "password": "..."
   * }
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "success": "true"
   *     }
   *
   *
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 404 Not Found
   *     {
   *       "type": "Auth/ClientCodeNotCorrect",
   *       "message": "The registered code is incorrect. Please request a new one."
   *     }
   */
  router.post(
    '/changePassword',
    validate({
      body: {
        email: joi.string().trim().email().required(),
        password: joi.string().trim().min(6).max(100).required(),
        code: joi.string().trim().required(),
      },
    }),
    CtrlAuth.changePassword,
  );

  /**
   * @api {get} /auth/refreshToken Actualizar token
   * @apiName refreshToken
   * @apiGroup Auth
   *
   * @apiParam {String} authorization Token de autorización
   *
   * @apiExample {json} Example usage:
   * {
   *    "authorization": "...",
   * }
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "token": "..."
   *     }
   *
   *
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 404 Not Found
   *     {
   *       "type": "Auth/InvalidToken",
   *       "message": "Token invalid"
   *     }
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
