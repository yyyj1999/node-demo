const auth = require('../lib/auth/auth');

/**
 * 登录
 * @route POST /auth/token
 * @group user
 * @param {string} username.body.required - 用户名
 * @param {string} password.body.required - 密码
 * @returns {object} 
 */
async function userLogin(req, res) {
    const options = {};
    const result = await auth.tokenHandler(req, res, options);

    return result;
}

module.exports = {
    userLogin,
};