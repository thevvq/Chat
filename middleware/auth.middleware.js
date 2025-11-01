const Account = require('../model/accounts.model');

module.exports.requireAuth = async (req, res, next) => {
  if (!req.cookies.token) {
    return res.redirect('/auth/login');
  }

  const user = await Account.findOne({ token: req.cookies.token });
  if (!user) {
    return res.redirect('/auth/login');
  }
  res.locals.user = user;
  next();
};
