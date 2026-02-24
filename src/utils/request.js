const {
    sequelize: { literal },
    Sequelize: { Op }
} = require('../models');

exports.filterByQuery = (schemaKeys, params) => {
    const where = {};
    Object.keys(params).forEach(key => {
        if (!schemaKeys.includes(key)) {
            return;
        }
        let realKey = key;
        let value = params[key];
        if (key.indexOf('.') > -1) {
            realKey = `$${key}$`;
        }
        if (value.indexOf(',') > -1) {
            value = value.split(',');
            where[realKey] = {
                [Op.in]: value
            };
        } else {
            where[realKey] = value;
        }
    });
    return where;
};


exports.parseOrder = (allowedKeys, string, useLiteral = false) => {
    const params = string.split(',');
    const result = [];
    for (let i = 0; i < params.length; i += 2) {
        const key = params[i];
        if (!allowedKeys.includes(key)) {
            continue;
        }
        const sort = `${params[i + 1]}`.trim();
        if (!sort) {
            break;
        } else if (!['ASC', 'DESC'].includes(sort.toUpperCase())) {
            continue;
        }
        result.push([useLiteral ? literal(key.trim()) : key.trim(), sort.trim().toUpperCase()]);
    }
    return result;
};
