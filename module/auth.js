const auth = require('../lib/auth/auth');

/**
 * 用户登录
 * @route POST /auth/token
 * @group user - 用户中心
 * @consumes application/x-www-form-urlencoded
 * @param {string} username.body.required - 请输入用户名
 * @param {string} password.body.required - 请输入密码
 * @returns {string} accessToken - 授权令牌
 * @returns {string} tokenType - 'Bearer' 令牌类型
 * @returns {number} expiresIn - 令牌有效期
 * @returns {string} refreshToken - 刷新令牌
 * @security JWT
 */
async function userLogin(req, res) {
    const options = {};
    const result = await auth.tokenHandler(req, res, options);

    return result;
}

module.exports = {
    userLogin,
};