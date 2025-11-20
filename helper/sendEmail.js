const nodemailer = require('nodemailer')

module.exports.sendVerificationEmail = async (to, content) => {
    // content may be a plain text message or a verification link
    const host = process.env.SMTP_HOST
    const port = process.env.SMTP_PORT
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    if (!host || !port || !user || !pass) {
        // SMTP not configured — fallback to logging the message for local development
        console.log(`Verification email for ${to}: ${content}`)
        return { success: true, info: 'logged' }
    }

    // debug: print SMTP config (without password) so we can validate env is loaded
    console.log('SMTP config:', { host, port, user: user ? user.replace(/(.).+(@.+)/, '$1***$2') : user })

    const transporter = nodemailer.createTransport({
        host,
        port: parseInt(port, 10),
        secure: port == 465,
        auth: { user, pass }
    })

    const mailOptions = {
        from: process.env.EMAIL_FROM || user,
        to,
        subject: 'Xác thực địa chỉ email',
        text: content,
        html: `<p>${content}</p>`
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        console.log('sendVerificationEmail sent, info:', info)
        return { success: true, info }
    } catch (err) {
        // print useful details to help debugging (auth errors, connection errors)
        console.error('sendVerificationEmail error', err && err.message ? err.message : err)
        if (err && err.response) console.error('SMTP response:', err.response)
        return { success: false, error: err }
    }
}
