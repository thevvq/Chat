const User = require('../model/accounts.model');
const md5 = require('md5');

// [GET] /auth/register
module.exports.register = async (req, res) => {
    res.render('pages/auth/register', {
        pageTitle: 'Đăng ký'
    })
}

// [Post] /auth/register
module.exports.registerPost = async (req, res) => {
    const emailExist = await User.findOne({
        email: req.body.email,
        deleted: false
    });

    if (emailExist) {
        res.redirect('back');
        return;
    }

    req.body.password = md5(req.body.password);

    const record = new User(req.body)
    await record.save();
    res.redirect('/auth/login');
}

// [GET] /auth/login
module.exports.login = async (req, res) => {
    if (req.cookies.token) {
        return  res.redirect('/');
    }
    
    res.render('pages/auth/login', {
        pageTitle: 'Đăng nhập'
    })
}

// [POST] /auth/login
module.exports.loginPost = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({
        email: email,  
        deleted: false 
    });
    if (!user) {
        res.redirect('back');
        return;
    }
    if (md5(password) !== user.password) {
        res.redirect('back');
        return;
    }

    res.cookie('token', user.token)

    await User.updateOne({
        token: user.token
    }, {
        statusOnline: 'online'
    })

    // PresenceSocket will notify clients on socket connection.

    res.redirect('/');

}

// [GET] /auth/logout
module.exports.logout = async (req, res) => {
    const token = req.cookies.token;

    // Tìm user từ token hiện tại
    const user = await User.findOne({ token: token });

    if (user) {
        // Cập nhật trạng thái offline
        await User.updateOne({ token: token }, { statusOnline: 'offline' });

        // Thông báo cho mọi client khác biết user này offline
        _io.emit('server-return-user-status-online', {
            userID: user.id,
            status: 'offline'
        });
    }

    // Xoá cookie đăng nhập
    res.clearCookie('token');

    // Điều hướng về trang đăng nhập
    res.redirect('/auth/login');
};
