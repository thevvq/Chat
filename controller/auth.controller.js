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
const generate = require('../helper/generate');

// Helper to compute server URL per-request. Prefer `process.env.SERVER_URL`,
// otherwise build from the incoming request so links match how the client reached the server.
function getServerUrlForReq(req) {
    const raw = process.env.SERVER_URL;
    if (raw) {
        let url = raw;
        if (!/^https?:\/\//i.test(url)) url = `http://${url}`;
        return url.replace(/\/$/, '');
    }
    // Build from request
    const proto = req.protocol || 'http';
    const host = req.get && req.get('host') ? req.get('host') : `localhost:${process.env.PORT || 3000}`;
    return `${proto}://${host}`.replace(/\/$/, '');
}

// [GET] /auth/register
module.exports.register = async (req, res) => {
    res.render('pages/auth/register', { pageTitle: 'Đăng ký' });
}

// [POST] /auth/register
module.exports.registerPost = async (req, res) => {
    const { email, password: rawPassword, fullName, numberPhone } = req.body;

    const existing = await User.findOne({ email, deleted: false });

    // Nếu email đã tồn tại và đã xác thực → báo lỗi
    if (existing && existing.verified) {
        req.flash('error', 'Email đã tồn tại. Vui lòng sử dụng email khác.');
        return res.redirect('/auth/register'); // giữ lại form đăng ký
    }

    // Prepare password hash và token mới
    const hashed = md5(rawPassword);
    const newVerifyToken = generate.generateRandomToken(40);

    // Build verify link
    const finalServerUrl = getServerUrlForReq(req);
    if (!process.env.SERVER_URL) console.warn('SERVER_URL is not set; using request host for verify link:', finalServerUrl);
    const verifyLink = `${finalServerUrl}/auth/verify-email?token=${newVerifyToken}`;

    // Nếu email đã tồn tại nhưng chưa xác thực → cập nhật token và gửi lại email
    if (existing && !existing.verified) {
        existing.fullName = fullName;
        existing.password = hashed;
        existing.numberPhone = numberPhone;
        existing.verifyToken = newVerifyToken;
        await existing.save();

        await sendEmail(
            email,
            'Xác thực tài khoản Chat App',
            `<p>Nhấn vào link để xác thực: <a href="${verifyLink}">${verifyLink}</a></p>`
        );

        return res.render('pages/auth/emailSent', {
            pageTitle: 'Gửi lại email xác thực',
            message: `Email xác thực đã được gửi tới ${email}`
        });
    }

    // User mới → tạo record
    const record = new User({ fullName, email, password: hashed, numberPhone, verifyToken: newVerifyToken });
    await record.save();

    await sendEmail(
        email,
        'Xác thực tài khoản Chat App',
        `<p>Nhấn vào link để xác thực: <a href="${verifyLink}">${verifyLink}</a></p>`
    );

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

    const finalServerUrl = getServerUrlForReq(req);
    if (!process.env.SERVER_URL) console.warn('SERVER_URL is not set; using request host for verify link:', finalServerUrl);
    const verifyLink = `${finalServerUrl}/auth/verify-email?token=${user.verifyToken}`;
    console.log('Verification link generated (resend):', verifyLink);
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
        if (global._io) {
            global._io.emit('server-return-user-status-online', {
                userID: user.id,
                status: 'offline'
            });
        }
    }

    res.clearCookie('token');
    res.cookie('toastMessage', 'Đăng xuất thành công');
    res.cookie('toastType', 'success');
    return res.redirect('/auth/login');
};

