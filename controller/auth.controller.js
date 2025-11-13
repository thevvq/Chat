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

    _io.once('connection', (socket) => {
        socket.broadcast.emit('server-return-user-status-online', {
            userID: user.id,
            status: 'online'
        })
    })

    res.redirect('/');

}

// [GET] /auth/logout
module.exports.logout = async (req, res) => {
    await User.updateOne({
        token: req.cookies.token
    },{
        statusOnline: 'offline'
    })

    _io.once('connection', (socket) => {
        socket.broadcast.emit('server-return-user-status-online', {
            userID: res.locals.user.id,
            status: 'offline'
        })
    })

    res.clearCookie('token');
    res.redirect('/auth/login');
}