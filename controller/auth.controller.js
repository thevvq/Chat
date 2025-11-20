require("dotenv").config();
// Always prefer SERVER_URL for links in emails. If it's missing log a clear warning
// and fall back to localhost with PORT so functionality still works.
const _rawServerUrl = process.env.SERVER_URL;
let serverUrl;
if (!_rawServerUrl) {
    console.warn('WARNING: process.env.SERVER_URL is not set. Using fallback http://localhost:<PORT> for email links. Set SERVER_URL in production.');
    serverUrl = `http://localhost:${process.env.PORT || 3000}`;
} else {
    serverUrl = _rawServerUrl;
    if (!/^https?:\/\//i.test(serverUrl)) {
        console.warn('Notice: SERVER_URL does not include protocol. Prepending http:// to SERVER_URL.');
        serverUrl = `http://${serverUrl}`;
    }
}
serverUrl = serverUrl.replace(/\/$/, '');
console.log('Using serverUrl for email links:', serverUrl);

const User = require('../model/accounts.model');
const md5 = require('md5');
const sendEmail = require('../scripts/sendEmail');

// [GET] /auth/register
module.exports.register = async (req, res) => {
    res.render('pages/auth/register', { pageTitle: 'Đăng ký' })
}

// [POST] /auth/register
module.exports.registerPost = async (req, res) => {
    const emailExist = await User.findOne({ email: req.body.email, deleted: false });

    if (emailExist) {
        req.flash('error', 'Email đã tồn tại.');
        return res.redirect('back');
    }

    req.body.password = md5(req.body.password);
    const record = new User(req.body)
    await record.save();

    // Gửi email xác thực
    const verifyLink = `${serverUrl}/auth/verify-email?token=${record.verifyToken}`;
    await sendEmail(
        record.email,
        'Xác thực tài khoản Chat App',
        `<p>Nhấn vào link để xác thực: <a href="${verifyLink}">${verifyLink}</a></p>`
    );

    // Render email sent page
    return res.render('pages/auth/emailSent', {
        pageTitle: 'Xác thực email',
        message: `Chúng tôi đã gửi email xác thực tới ${record.email}`
    });
}

// [GET] /auth/verify-email
module.exports.verifyEmail = async (req, res) => {
    const { token } = req.query;
    const user = await User.findOne({ verifyToken: token });

    if (!user) {
        return res.render('pages/auth/verificationFailed', {
            pageTitle: 'Xác thực thất bại',
            message: 'Liên kết xác thực không hợp lệ hoặc đã hết hạn.'
        });
    }

    user.verified = true;
    user.verifyToken = null;
    await user.save();

    res.render('pages/auth/verified', { pageTitle: 'Xác thực thành công' });
}

// [GET] /auth/resend-email
module.exports.resendEmail = async (req, res) => {
    const email = req.query.email;
    const user = await User.findOne({ email });

    if (!user) {
        req.flash('error', 'Email không tồn tại.');
        return res.redirect('/auth/login');
    }

    if (user.verified) {
        req.flash('success', 'Email đã được xác thực.');
        return res.redirect('/auth/login');
    }

    // Gửi lại email xác thực
    const verifyLink = `${serverUrl}/auth/verify-email?token=${user.verifyToken}`;
    await sendEmail(
        user.email,
        'Xác thực tài khoản Chat App',
        `<p>Nhấn vào link để xác thực: <a href="${verifyLink}">${verifyLink}</a></p>`
    );

    res.render('pages/auth/emailSent', {
        pageTitle: 'Gửi lại email xác thực',
        message: `Email xác thực đã được gửi lại tới ${email}`
    });
}

// [GET] /auth/login
module.exports.login = async (req, res) => {
    if (req.cookies.token) return res.redirect('/');
    res.render('pages/auth/login', { pageTitle: 'Đăng nhập' })
}

// [POST] /auth/login
module.exports.loginPost = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, deleted: false });

    if (!user) return res.render('pages/auth/login', { pageTitle: 'Đăng nhập', message: 'Email hoặc mật khẩu không đúng.' })
    if (md5(password) !== user.password) return res.render('pages/auth/login', { pageTitle: 'Đăng nhập', message: 'Email hoặc mật khẩu không đúng.', email })
    if (!user.verified) return res.render('pages/auth/login', { pageTitle: 'Đăng nhập', message: 'Vui lòng xác thực email trước khi đăng nhập.' })

    res.cookie('token', user.token)

    await User.updateOne({ token: user.token }, { statusOnline: 'online' })
    if (global._io) global._io.emit('server-return-user-status-online', { userID: user.id, status: 'online' })
    return res.redirect('/')
}

// [GET] /auth/logout
module.exports.logout = async (req, res) => {
    const token = req.cookies.token;
    const user = await User.findOne({ token });
    if (user) {
        await User.updateOne({ token }, { statusOnline: 'offline' });
        if (global._io) global._io.emit('server-return-user-status-online', { userID: user.id, status: 'offline' });
    }
    res.clearCookie('token');
    res.redirect('/auth/login');
}
