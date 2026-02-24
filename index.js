const chalk = require('chalk');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const { resolve: pathResolve } = require('path');

const myEnv = dotenv.config({
  path: pathResolve(__dirname, './.env'),
});
dotenvExpand(myEnv);

const { httpServer, app } = require('./server');
const Logger = require('./src/utils/Logger');
const { sequelize } = require('./src/models');

function listenAsync(port, host) {
  return new Promise(function asyncResolve(resolve) {
    httpServer.listen(port, host, function callback() {
      return resolve();
    });
  });
}

const HOST = process.env.SERVER_HOST || '127.0.0.1';
const PORT = process.env.SERVER_PORT || 3000;

sequelize
  .authenticate()
  .then(function cb() {
    return listenAsync(PORT, HOST);
  })
  .then(function listening() {
    Logger.info(
      '%s Panel running at http://%s:%d',
      chalk.green('✓'),
      HOST,
      PORT,
    );
    Logger.info('%s CTRL-C to end the process', chalk.green('*'));
    return httpServer;
  })
  .catch(function onError(error) {
    Logger.error('Error', error);
    process.exit(1);
  });

process.on('SIGINT', function exit() {
  Logger.info('Server is exiting...');
  process.exit(0);
});
