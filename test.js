const argon2 = require('argon2');
const Joi = require('@hapi/joi');
const _ = require('lodash');
const Thenjs = require('thenjs');

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
        const argon2Hash = await argon2.hash('123456', argonOptions);
        
        console.log(argon2Hash);
        // 验证密码
        const verify = await argon2.verify(argon2Hash, password);
        console.log(verify);
        returnData.isRight = verify;
    } catch (err) {
        console.log(JSON.stringify(err));
    }
 
    return returnData;
}

// (userSignOn({ 'password': 'yuanjian'}));

// const dayjs = require('dayjs');
// const date1 = dayjs('2020-03-19');
// const year = date1.diff('2020-03-18', 'year', true).toFixed(2);
// console.log(year <= 0 ? '0.01' : year);
const _formatePaper = (exampaper)=> {
    for (let i in exampaper) {
        if (exampaper[i] instanceof Array) {
            if (i.includes('[') && i.includes(']')) {
                let k = i.replace('[', '').replace(']', '');
                exampaper[`${k}`] = _formatePaper(exampaper[i]);
            } else {
                exampaper[`[${i}]`] = _formatePaper(exampaper[i]);
            }
            delete exampaper[i];
        }
        if (exampaper[i] instanceof Object) {
            _formatePaper(exampaper[i]);
        }
    }

    console.log(exampaper);
    return exampaper;
};

const a = new Object();
a.fn = function () {
    console.log(this);
};

