const Seven = require('node-7z');
const logger = require('./Logger');

async function compressFiles(fileName, filesDir) {
  return new Promise((resolve, reject) => {
    try {
      console.log(filesDir);
      const stream = Seven.add(fileName, filesDir, {
        recursive: true,
      });

      stream.on('data', (data) => {
        logger.debug(`Comprimiendo archivo: ${data.file}`);
      });

      stream.on('end', () => {
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  compressFiles,
};
