const joi = require('joi');
const validate = require('../../middlewares/validate.middleware');
const hasAuth = require('../../middlewares/auth.middleware.js');
const CtrlUsers = require('./users.controller');

module.exports = (Router) => {
  const router = new Router({
    prefix: '/usuarios',
  });

  router.use(hasAuth);

  router.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      console.error(error);
      ctx.internalServerError({
        type: 'Server/InternalServerError',
        message: 'Hubo un error al procesar la solicitud',
      });
    }
  });

  /**
   * @api {get} /usuarios Obtener todos los usuarios
   * @apiName getUsuarios
   * @apiGroup Usuarios
   *
   * @apiQuery {Number} [limit] Límite de registros por página (default: 10)
   * @apiQuery {Number} [page]  Página actual (default: 1)
   * @apiQuery {String} [order] Parámetro de ordenamiento (asc | desc)
   * @apiQuery {String} [search] Búsqueda por nombre o email
   * @apiQuery {String} [role]  Filtrar por rol (coach | client)
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "count": 2,
   *   "rows": [
   *     {
   *       "id": 1,
   *       "name": "Carlos Ruiz",
   *       "email": "carlos@gmail.com",
   *       "avatar": null,
   *       "is_active": true,
   *       "role": { "id": 1, "name": "coach" }
   *     },
   *     {
   *       "id": 2,
   *       "name": "Ana López",
   *       "email": "ana@gmail.com",
   *       "avatar": null,
   *       "is_active": true,
   *       "role": { "id": 2, "name": "client" }
   *     }
   *   ]
   * }
   */
  router.get(
    '/',
    validate({
      query: {
        limit:  joi.number().integer().positive(),
        page:   joi.number().integer().positive(),
        order:  joi.string().trim(),
        search: joi.string().trim(),
        role:   joi.string().valid('coach', 'client'),
      },
    }),
    CtrlUsers.getUsuarios,
  );

  /**
   * @api {get} /usuarios/:id Obtener detalle de un usuario
   * @apiName getUsuario
   * @apiGroup Usuarios
   *
   * @apiParam {Number} id ID del usuario.
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "id": 1,
   *   "name": "Carlos Ruiz",
   *   "email": "carlos@gmail.com",
   *   "avatar": null,
   *   "is_active": true,
   *   "role": {
   *     "id": 1,
   *     "name": "coach",
   *     "description": "Entrenador que crea planes y gestiona clientes"
   *   }
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 404 Not Found
   * {
   *   "type": "User/NoEncontrado",
   *   "message": "No se encontró usuario con ese identificador."
   * }
   */
  router.get(
    '/:id',
    validate({
      params: {
        id: joi.number().integer().positive(),
      },
    }),
    CtrlUsers.getUsuario,
  );

  /**
   * @api {post} /usuarios Crear un nuevo usuario
   * @apiName addUsuario
   * @apiGroup Usuarios
   *
   * @apiBody {String} name     Nombre completo del usuario.
   * @apiBody {String} email    Email del usuario.
   * @apiBody {String} password Contraseña (mínimo 6 caracteres).
   * @apiBody {String} role     Rol del usuario: "coach" o "client".
   *
   * @apiParamExample {json} Input:
   * {
   *   "name": "Carlos Ruiz",
   *   "email": "carlos@gmail.com",
   *   "password": "123456",
   *   "role": "coach"
   * }
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "id": 1,
   *   "name": "Carlos Ruiz",
   *   "email": "carlos@gmail.com",
   *   "avatar": null,
   *   "is_active": true,
   *   "role": { "id": 1, "name": "coach" }
   * }
   *
   * @apiErrorExample {json} Email duplicado:
   * HTTP/1.1 409 Conflict
   * {
   *   "type": "User/EmailExiste",
   *   "message": "Ya existe un usuario con ese email."
   * }
   *
   * @apiErrorExample {json} Rol inválido:
   * HTTP/1.1 400 Bad Request
   * {
   *   "type": "User/RolInvalido",
   *   "message": "El rol especificado no existe. Usa coach o client."
   * }
   */
  router.post(
    '/',
    validate({
      body: {
        name:     joi.string().trim().required(),
        email:    joi.string().trim().email().required(),
        password: joi.string().trim().min(6).required(),
        role:     joi.string().valid('coach', 'client').required(),
      },
    }),
    CtrlUsers.addUsuario,
    CtrlUsers.getUsuario,
  );

  /**
   * @api {put} /usuarios/:id Actualizar un usuario
   * @apiName updateUsuario
   * @apiGroup Usuarios
   *
   * @apiParam {Number} id ID del usuario.
   *
   * @apiBody {String} [name]     Nombre completo.
   * @apiBody {String} [email]    Email del usuario.
   * @apiBody {String} [password] Nueva contraseña (mínimo 6 caracteres).
   * @apiBody {String} [role]     Nuevo rol: "coach" o "client".
   *
   * @apiParamExample {json} Input:
   * {
   *   "name": "Carlos Ruiz Editado",
   *   "role": "client"
   * }
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "id": 1,
   *   "name": "Carlos Ruiz Editado",
   *   "email": "carlos@gmail.com",
   *   "avatar": null,
   *   "is_active": true,
   *   "role": { "id": 2, "name": "client" }
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 404 Not Found
   * {
   *   "type": "User/NoEncontrado",
   *   "message": "No se encontró al usuario con ese identificador."
   * }
   */
  router.put(
    '/:id',
    validate({
      params: {
        id: joi.number().integer().positive(),
      },
      body: {
        name:     joi.string().trim().optional(),
        email:    joi.string().trim().email().optional(),
        password: joi.string().trim().min(6).optional(),
        role:     joi.string().valid('coach', 'client').optional(),
      },
    }),
    CtrlUsers.updateUsuario,
    CtrlUsers.getUsuario,
  );

  /**
   * @api {put} /usuarios/estatus/:id Activar o desactivar un usuario
   * @apiName activateUsuario
   * @apiGroup Usuarios
   *
   * @apiParam {Number} id ID del usuario.
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "success": true,
   *   "is_active": false
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 404 Not Found
   * {
   *   "type": "User/NoEncontrado",
   *   "message": "No se encontró al usuario con ese identificador."
   * }
   */
  router.put(
    '/estatus/:id',
    validate({
      params: {
        id: joi.number().integer().positive(),
      },
    }),
    CtrlUsers.activateUsuario,
  );

  return router;
};