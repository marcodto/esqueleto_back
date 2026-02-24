const multer = require('@koa/multer');
const path = require('path');

const tempPath = path.join(__dirname, '../../public/tmp');
const mimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

module.exports = documentUpload = () => {
  const fileUpload = multer({
    dest: tempPath,
    limits: {
      fileSize: 10e7,
      files: 1,
    },
    storage: multer.diskStorage({
      filename(req, file, cb) {
        const orgName = path.parse(file.originalname);
        cb(
          null,
          `${orgName.name}-${Math.round(new Date().getTime() / 1000)}${
            orgName.ext
          }`,
        );
      },
    }),
    fileFilter: function onFilter(req, file, cb) {
      cb(null, mimeTypes.includes(file.mimetype));
    },
  }).single('file');
  return fileUpload;
};

module.exports = multiUpload = () => {
  multer({
    dest: tempPath,
    limits: {
      fileSize: 10e7,
      files: 30,
    },
    storage: multer.diskStorage({
      filename(req, file, cb) {
        const orgName = path.parse(file.originalname);
        cb(
          null,
          `${file.fieldname}-${Math.round(new Date().getTime() / 1000)}${
            orgName.ext
          }`,
        );
      },
    }),
    fileFilter: function onFilter(req, file, cb) {
      cb(null, mimeTypes.includes(file.mimetype));
    },
  }).fields([
    {
      name: 'name_file',
      maxCount: 1,
    },
  ]);
};
