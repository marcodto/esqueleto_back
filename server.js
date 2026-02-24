const http = require('http');
const Koa = require('koa');
const BodyParser = require('koa-bodyparser');
const helmet = require('koa-helmet');
const chalk = require('chalk');
const respond = require('koa-respond');
const Logger = require('./src/utils/Logger');
const logger = require('koa-logger');
const applyApiMiddleware = require('./src/controllers');

const serve = require('koa-static');

const app = new Koa();

app.on('error', function onError(error, ctx) {
	Logger.error(error);
});


app.use(helmet());

app.use(
	respond({
		statusMethods: {
			conflict: 409
		}
	})
);

app.use(async function corsMiddleware(ctx, next) {
	ctx.set('Access-Control-Max-Age', '86400');
	ctx.set('Access-Control-Allow-Origin', '*');
	ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	ctx.set(
		'Access-Control-Allow-Headers',
		'X-Requested-With, X-Request-Id, content-type, Authorization'
	);
	ctx.set('Access-Control-Allow-Credentials', 'true');
	if (ctx.request.method === 'OPTIONS') {
		ctx.status = 200;
		ctx.body = 'OK';
		return;
	}
	await next();
});

app.use(
	BodyParser({
		enableTypes: ['json'],
		jsonLimit: '5mb',
		strict: true,
		onerror: function(err, ctx) {
			return ctx.throw(422, {
				type: 'Server/JSONParseError',
				message: 'JSON Body invalid, please verify.'
			});
		}
	})
);

app.use(
	logger({
		transporter: (str, args) => {
			Logger.info(`${str}`);
		}
	})
);

applyApiMiddleware(app);

app.use(serve('./public'));
module.exports = {
	httpServer: http.createServer(app.callback()),
	app
};
