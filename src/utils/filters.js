const Joi = require('joi');
const {
	sequelize: { literal },
	Sequelize: { Op }
} = require('#models');

function typeToJoiRule(type) {
	switch (String(type.constructor)) {
		case 'STRING':
			return Joi.string()
				.max(type._length || 255)
				.trim();
		case 'TINYINT':
		case 'INTEGER':
		case 'BIGINT':
			return Joi.number()
				.integer()
				.positive()
				.allow(0);
		case 'DECIMAL':
		case 'NUMERIC':
			return Joi.number();
		case 'DATE':
			return Joi.string().isoDate();
		case 'BOOLEAN':
			return Joi.boolean();
		default:
			return Joi.string()
				.max(255)
				.trim();
	}
}

/**
 * Hace un filtro en el modelo por los query-parameters requeridos.
 * Sólo usa aquellos que están en el esquema.
 * @param {Object} schemaKeys Schema keys from the model.
 * @param {Object} params Query paramameters from the request.
 */
exports.filterByQuery = function filterByQuery(schema, params) {
	const schemaJoi = {};
	const schemaValues = {};
	const where = {};
	const paramKeys = Object.keys(params);
	for (let i = 0; i < paramKeys.length; i += 1) {
		const param = paramKeys[i];

		if (!schema[param]) {
			continue;
		}
		let value = `${params[param]}`;
		const firstValue = value[0];
		if (['<', '>', '!'].includes(firstValue)) {
			value = value.slice(1);
		}
		if (value.indexOf(',') > -1) {
			value = value.split(',');
			schemaJoi[param] = Joi.array().items(typeToJoiRule(schema[param].type));
			schemaValues[param] = value;
			if (firstValue !== '!') {
				where[param] = {
					[Op.in]: value
				};
			} else {
				where[param] = {
					[Op.notIn]: value
				};
			}
		} else if (value.indexOf('|') > -1) {
			value = value.split('|');
			schemaJoi[param] = Joi.array().items(typeToJoiRule(schema[param].type));
			schemaValues[param] = value;
			if (firstValue !== '!') {
				where[param] = {
					[Op.between]: value
				};
			} else {
				where[param] = {
					[Op.notBetween]: value
				};
			}
		} else if (value === 'null') {
			schemaJoi[param] = typeToJoiRule(schema[param].type).allow('null', null);
			schemaValues[param] = value;
			if (firstValue !== '!') {
				where[param] = {
					[Op.is]: value
				};
			} else {
				where[param] = {
					[Op.not]: value
				};
			}
		} else if (firstValue === '<') {
			schemaJoi[param] = typeToJoiRule(schema[param].type);
			schemaValues[param] = value;
			where[param] = {
				[Op.lt]: value
			};
		} else if (firstValue === '>') {
			schemaJoi[param] = typeToJoiRule(schema[param].type);
			schemaValues[param] = value;
			where[param] = {
				[Op.gt]: value
			};
		} else if (firstValue === '!') {
			schemaJoi[param] = typeToJoiRule(schema[param].type);
			schemaValues[param] = value;
			where[param] = {
				[Op.not]: value
			};
		} else if (value === 'true' || value === 'false') {
			schemaJoi[param] = typeToJoiRule(schema[param].type);
			schemaValues[param] = value === 'true' ? true : false;
			where[param] = value === 'true' ? true : false;
		} else {
			schemaJoi[param] = typeToJoiRule(schema[param].type);
			schemaValues[param] = value;
			where[param] = value;
		}
	}
	const { error } = Joi.object(schemaJoi).validate(schemaValues);
	if (error) {
		throw error;
	}
	return where;
};

/**
 * Hace un arreglo compatible con el order by de sequelize.
 * Solo usa aquellos que están en el esquema.
 * @example id_auto,-createdAt.
 * @param {Object} allowedKeys Llaves del esquema del modelo.
 * @param {String} string Orden del query.
 */
exports.parseOrder = function parseOrder(allowedKeys, string) {
	const params = string.split(',');
	const result = [];
	for (let i = 0; i < params.length; i += 1) {
		let key = params[i];
		let sort = 'asc';
		const sorter = key[0];
		switch (sorter) {
			case '-':
				key = key.slice(1);
				sort = 'desc';
				break;
			case '+':
				key = key.slice(1);
				break;
			default:
		}
		if (!allowedKeys.includes(key)) {
			// eslint-disable-next-line no-continue
			continue;
		}
		result.push([key, sort]);
	}
	return result;
};

exports.methodConvert = method => {
	switch (method) {
		case 'get':
			return 'read';
		case 'post':
			return 'create';
		case 'put':
		case 'patch':
			return 'update';
		case 'delete':
			return 'delete';
		default:
			return method;
	}
};

exports.isPermitted = function isPermitted(name, ctx, next) {
	const { req, usuario } = ctx;
	const permission = `${name}:${exports.methodConvert(req.method.toLowerCase())}`;
	const userPerm = usuario.permisos.find(perm => perm.nombre === permission);
	if (userPerm === undefined) {
		return ctx.send(403, {
			type: 'Auth/NoPermission',
			message: 'No tienes permiso para acceder a este módulo.'
		});
	}
	return next();
};

exports.getChangedModel = (model, previousValues) => {
	const changedObject = {};
	const afterValues = model.get({ plain: true });
	Object.keys(afterValues).forEach(key => {
		if (key === 'updatedAt' || key === 'createdAt') return;
		if (previousValues[key] === afterValues[key]) {
			return;
		}
		changedObject[key] = {
			before: previousValues[key],
			after: afterValues[key]
		};
	});
	return changedObject;
};
