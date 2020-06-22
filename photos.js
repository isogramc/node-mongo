const multer  = require('multer');
const storage =  multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './images/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now().toString() + '-' + file.originalname.split('').map(c =>c.trim()).join(''));
    }
});

var upload = multer({ storage: storage });

module.exports = upload;
