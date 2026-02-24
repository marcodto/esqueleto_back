const redis = require('async-redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis);

const client = redis.createClient(
  process.env.REDIS_PORT,
  process.env.REDIS_HOST,
);

module.exports = client;
