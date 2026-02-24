const joi = require('joi');

class ValidateError extends Error {
    constructor(message, prop) {
        super(message);
        this.prop = prop;
        this.message = message;
        this.stack = new Error().stack;
    }
}

function validateType(object = {}, label, schema, options) {
    if (!schema) {
        return {};
    }
    const joiObjectSchema = joi.object(schema);
    const { error, value } = joiObjectSchema.validate(object, schema, options);
    if (error) {
        throw new ValidateError(error.message, label);
    }
    return value;
}

/**
 * Middleware de koa para validar esquema con Joi
 * @param {Object} validateObject
 * @param {Object} validateObject.headers Headers del contexto.
 * @param {Object} validateObject.params Parametros de la ruta.
 * @param {Object} validateObject.query Parametros consulta (Query params).
 * @param {Object} validateObject.body Esquema del cuerpo.
 * @returns La función middleware
 */
module.exports = function validate(validateObject, options = {}) {
    return (ctx, next) => {
        try {
            if (ctx.headers && validateObject.headers) {
                ctx.headers = validateType(ctx.headers, 'Headers', validateObject.headers, { ...options, allowUnknown: true });
            }
            if (ctx.params && validateObject.params) {
                ctx.params = validateType(ctx.params, 'Url Params', validateObject.params, options);
            }
            if (ctx.query && validateObject.query) {
                ctx.query = validateType(ctx.query, 'Query Params', validateObject.query, { ...options, allowUnknown: true });
            }
            if (ctx.request.body && validateObject.body) {
                ctx.request.body = validateType(ctx.request.body, 'Request Body', validateObject.body, options);
            }
            return next();
        } catch (error) {
            return ctx.badRequest({
                type: 'Validation/ValidationError',
                in: error.prop,
                message: error.message
            });
        }
    };
};
