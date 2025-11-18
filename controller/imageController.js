const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

exports.uploadImage = [
    upload.single('image'),
    (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'Không có file nào!' });
        }

        const imageUrl = '/uploads/' + req.file.filename;

        return res.json({
            message: 'Upload thành công!',
            imageUrl
        });
    }
];
