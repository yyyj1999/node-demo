const auth = require('../lib/auth/auth');
const argon2 = require('argon2');

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
 * @returns {object} data - {accessToken: string,//授权令牌\ntokenType:'Bearer',// 令牌类型\nexpiresIn:int, // 令牌有效期\nrefreshToken:string,// 刷新令牌}
 * @security JWT
 */
async function userLogin(req, res) {
    const options = {};
    const result = await auth.tokenHandler(req, res, options);

    return result;
}

async function userSignOn(requestData) {
    const returnData = {
        isRight: false
    };
    // const username = requestData.useranme;
    const password = requestData.password;
    // 加密密码
    try {
        const argonOptions = {
            type: argon2.argon2id,
        };
        const argon2Hash = await argon2.hash('yuanjian', argonOptions);
        console.log(argon2Hash);
        // 验证密码
        const verify = await argon2.verify(argon2Hash, password);
        returnData.isRight = verify;
    } catch (err) {
        console.log(JSON.stringify(err));
    }
 
    return returnData;
}

module.exports = {
    userLogin,
    userSignOn,
};