const bcrypt = require('bcrypt');

function genSaltAsync(rounds = 10) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(rounds, (err, salt) => {
      if (err) reject(err);
      resolve(salt);
    });
  });
}

function hashAsync(password, salt) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });
}

function compareAsync(candidate, password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidate, password, (err, isSame) => {
      if (err) reject(err);
      resolve(isSame);
    });
  });
}

async function hashSaltAsync(password, saltRound = 10) {
  const salt = await genSaltAsync(saltRound);
  return hashAsync(password, salt);
}

module.exports = {
  genSaltAsync,
  hashAsync,
  compareAsync,
  hashSaltAsync,
};
