const joi = require('joi');
const validate = require('../../middlewares/validate.middleware');
const hasAuth = require('../../middlewares/auth.middleware.js');
const CtrlUsers = require('./users.controller');
const path = require('path');
//const multer = require('@koa/multer');
const fs = require('fs');


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
     * @api {get} /usuarios Obtener los usuarios
     * @apiName getUsuarios
     * @apiGroup Usuarios
     *
     * @apiParam {Number} limit Limite de estados por pagina
     * @apiParam {Number} page Pagina actual
     * @apiParam {String} [order] Parametro de ordenamiento
     *
     *@apiSuccessExample {json} Success-Response:
        {
    "count": 2,
    "rows": [
      {
           "usuario_id": 4,
            "nombre": "Jorge 2",
            "apellido": "Valenzuela",
            "usuario": "jorge.valenzuela",
            "email": "jvalenzuela@correo.com",
            "telefono": null,
            "direccion": null,
            "estado": null,
            "ciudad": null,
            "codigo_postal": null,
            "empresa": null,
            "estatus": true
      },
      {
           "usuario_id": 5,
            "nombre": "Mario",
            "apellido": "Valenzuela",
            "usuario": "mval",
            "email": "mval@correo.com",
            "telefono": null,
            "direccion": null,
            "estado": null,
            "ciudad": null,
            "codigo_postal": null,
            "empresa": null,
            "estatus": true
      }
     
    ]
}
	*/
  router.get(
    '/',
    validate({
      query: {
        limit: joi.number().integer().positive(),
        page: joi.number().integer().positive(),
        order: joi.string().trim(),
        search: joi.string().trim(),
        status: joi.bool(),
      },
    }),
    CtrlUsers.getUsuarios,
  );

  /**
     * @api {get} /usuarios/:id Detalle de un usuario.
     * @apiName getUsuario
     * @apiGroup Usuarios
     * 
     * @apiParam {Number} id usuario_id ID del usuario.
     *
     * @apiSuccessExample Success-Response:
        HTTP/1.1 200 OK
        {
            "usuario_id": 1,
            "nombre": "Jorge 2",
            "apellido": "Valenzuela",
            "usuario": "jorge.valenzuela",
            "email": "jvalenzuela@correo.com",
            "telefono": null,
            "direccion": null,
            "estado": null,
            "ciudad": null,
            "codigo_postal": null,
            "empresa": null,
            "estatus": true
        }
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
	 *     {
	 *       "type": "Usuario/UsuarioNotFound",
	 *       "message": "No se encontró al usuario con este identificador."
	 *     }
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
     * @api {post} /usuarios Agrega un nuevo usuario
     * @apiName addUsuario
     * @apiGroup Usuarios
     *
     * @apiParam {Number} nombre nombre del usuario.
     * @apiParam {String} apellido apellido del usuario.
     * @apiParam {String} usuario nombre de usuario.
     * @apiParam {String} email email del usuario.
     * @apiParam {String} password contraseña del usuario.
     * @apiParam {String} [telefono] Número telefónico del usuario.
     * @apiParam {String} [direccion] Dirección del usuario.
     * @apiParam {String} [estado] Estado del usuario.
     * @apiParam {String} [ciudad] Ciudad del usuario.
     * @apiParam {String} [codigo_postal] Código postal del usuario.
     * @apiParam {Boolean} [es_admin] Es administrador del sistema.
     * @apiParam {String} [fecha_nacimiento] Licencia del usuario.
     *   
     * @apiParamExample {json} Input
     *   
        {
            "nombre": "Jorge",
            "apellido": "Rojas",
            "username": "jrojas",
            "email": "jrojas@correo.com",
            "password": "123456",
            "es_admin": true
        }
     *
     * @apiSuccessExample Success-Response:
        HTTP/1.1 200 OK
        {
            "usuario_id": 4,
            "nombre": "Jorge 2",
            "apellido": "Valenzuela",
            "usuario": "jorge.valenzuela",
            "email": "jvalenzuela@correo.com",
            "telefono": null,
            "direccion": null,
            "estado": null,
            "ciudad": null,
            "codigo_postal": null,
            "empresa": null,
            "estatus": true
        }  
     *
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
	 *     {
	 *       "type": "Usuarios/ErrorRegistro",
	 *       "message": "Hubo un problema al tratar de registrar este usuario."
	 *     }
    */
  router.post(
    '/',
    validate({
      body: {
        nombre: joi.string().trim().required(),
        apellido: joi.string().trim().required(),
        usuario: joi.string().trim().required(),
        email: joi.string().trim().email().required(),
        password: joi.string().trim().required(),
        es_admin: joi.bool().required(),
        //opcionales        
        telefono: joi.string().trim().optional().allow(null),
        direccion: joi.string().trim().optional().allow(null),
        estado: joi.string().trim().optional().allow(null),
        ciudad: joi.string().trim().optional().allow(null),
        codigo_postal: joi.string().trim().optional().allow(null),
        feche_nacimiento: joi.string().trim().optional().allow(null),
      },
    }),
    CtrlUsers.addUsuario,
    CtrlUsers.getUsuario,
  );

  /**
     * @api {put} /usuatios/:id Modificar un usuario.
     * @apiName updateUsurio
     * @apiGroup Usuarios
     * 
     * @apiParam {Number} id usuario_id ID del usuario.
     * 
     * @apiParam {Number} nombre nombre del usuario.
     * @apiParam {String} apellido apellido del usuario.
     * @apiParam {String} usuario nombre de usuario.
     * @apiParam {String} email email del usuario.
     * @apiParam {String} password contraseña del usuario.
     * @apiParam {String} [telefono] Número telefónico del usuario.
     * @apiParam {String} [direccion] Dirección del usuario.
     * @apiParam {String} [estado] Estado del usuario.
     * @apiParam {String} [ciudad] Ciudad del usuario.
     * @apiParam {String} [codigo_postal] Código postal del usuario.
     * @apiParam {Boolean} [es_admin] Es administrador del sistema.
     * @apiParam {String} [fecha_nacimiento] Licencia del usuario.
     * @apiParam {Boolean} [estatus] Estatus del usuario.
     * 
     * @apiParamExample {json} Input
     *   
        {
            "nombre": "Jorge 2",
            "apellido": "Rojas",
            "usuario": "jrojas",
            "email": "jrojas@correo.com",
            "contraseña": "123456",
        }
     *
     * @apiSuccessExample Success-Response:
        HTTP/1.1 200 OK
        {
            "usuario_id": 4,
            "nombre": "Jorge 2",
            "apellido": "Valenzuela",
            "usuario": "jorge.valenzuela",
            "email": "jvalenzuela@correo.com",
            "telefono": null,
            "direccion": null,
            "estado": null,
            "ciudad": null,
            "codigo_postal": null,
            "empresa": null,
            "estatus": true
        }
     *
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
	 *     {
	 *       "type": "Usuario/NoEncontrado",
	 *       "message": "No se encontró al usuario con este identificador."
	 *     }
    */
  router.put(
    '/:id',
    validate({
      params: {
        id: joi.number().integer().positive(),
      },
      body: {
        nombre: joi.string().trim().optional(),
        apellido: joi.string().trim().optional(),
        usuario: joi.string().trim().optional(),
        email: joi.string().trim().email().optional(),
        password: joi.string().trim().optional(),
        es_admin: joi.bool().optional(),
        estatus: joi.bool().optional(),
        //opcionales        
        telefono: joi.string().trim().optional().allow(null),
        direccion: joi.string().trim().optional().allow(null),
        estado: joi.string().trim().optional().allow(null),
        ciudad: joi.string().trim().optional().allow(null),
        codigo_postal: joi.string().trim().optional().allow(null),
        feche_nacimiento: joi.string().trim().optional().allow(null),
      },
    }),
    CtrlUsers.updateUsuario,
    CtrlUsers.getUsuario,
  );

  /**
     * @api {put} /usuarios/estatus/:id Eliminar un usuario
     * @apiName deleteUsuario
     * @apiGroup Usuarios
     * 
     * @apiParam {Number} id usuario_id ID de un usuario.
     * 
     * @apiSuccessExample Success-Response:
        HTTP/1.1 200 OK
        {
            "success": true
        }
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not Found
	 *     {
	 *       "type": "User/NoEncontrado",
	 *       "message": "No se encontró el usuario con este identificador."
	 *     }
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
