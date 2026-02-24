const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const { resolve: pathResolve } = require('path');

const myEnv = dotenv.config({
	path: pathResolve(__dirname, '../../.env')
});
dotenvExpand(myEnv);

const { NODE_ENV: env = 'development' } = process.env;

module.exports = {
	[env]: {
		use_env_variable: 'DATABASE_CONNECTION',
		seederStorage: 'sequelize',
		logQueryParameters: true
	}
};
