// @ts-check
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const chalk = require('chalk');
const Logger = require('../utils/Logger');

const basename = path.basename(__filename);
const env = String(process.env.NODE_ENV);
const DATABASE_CONNECTION = process.env.DATABASE_CONNECTION;

Logger.info(`%s Node Mode: ${env}`, chalk.cyan('*'));
if (!DATABASE_CONNECTION) {
	throw new Error('No Database connection available. Set Env variable for DATABASE_CONNECTION.');
}

Logger.info('%s Creating database connection object.', chalk.yellow('*'));
Logger.info('%s Using database connection: %s', chalk.yellow('*'), DATABASE_CONNECTION);
const sequelize = new Sequelize.Sequelize(DATABASE_CONNECTION, {
	logging: function log(message) {
		Logger.debug(message);
	},
	dialect: 'mysql'
});

Logger.info('%s Connection object created.', chalk.green('✓'));
Logger.info('%s Reading models...', chalk.yellow('*'));
const db = {};
fs.readdirSync(__dirname)
	.filter(function filterDir(file) {
		return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
	})
	.forEach(function importModels(file) {
		const model = require(path.join(__dirname, `./${file}`));
		model.init(sequelize, Sequelize);
		db[model.name] = model;
	});

const keysDB = Object.keys(db);

keysDB.forEach(function associate(modelName) {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
	db[modelName].models = db;
});
Logger.info('%s Models loaded: %d', chalk.green('✓'), keysDB.length);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
