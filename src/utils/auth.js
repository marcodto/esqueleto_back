const { randomBytes } = require('crypto');
const { promisify } = require('util');
const redis = require('./redis');

const randomBytesAsync = promisify(randomBytes);

const { REDIS_PREFIX } = process.env;

async function createToken(length = 20) {
  const bytes = await randomBytesAsync(length);
  return bytes.toString('hex');
}

async function createCode(idCliente, prefix, digits = 6) {
  const number = Math.floor(Math.random() * 10 ** digits)
    .toString()
    .padStart(digits, '0');
  console.log('redis: ', `${REDIS_PREFIX}${prefix}${idCliente}`);
  let valorGuardado = await redis.set(
    `${REDIS_PREFIX}${prefix}${idCliente}`,
    number,
    'EX',
    86400,
  );
  return number;
}

module.exports = {
  createToken,
  createCode,
};
