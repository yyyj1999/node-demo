// const request = require('request');
// const _ = require('lodash');
const config = require('config');
const logger = require('../logger');
// const clients = require('./client.json'); // 客户端信息(小程序)
// const IntelligetnMarketing = require('../utils/IntelligetnMarketing');
const { redis } = require('../rediser');
const redisKey = 'authToken';
/**
 * 数据库
 */
// const mongodber = require('../utils/mongodber');
// const bookonline_db = mongodber.use('bookonline');

/**
 * 获取客户端信息
 * @param {*} client 客户端编号
 * @param {*} secret 客户端验证密钥
 */
async function getClient(client, secret) {
    // TODO 验证客户端信息

    // 重组数据
    const return_json = {
        // redirectUris: [],                // 授权模式指向url
        refreshTokenLifetime: config.get('oAuth').refreshTokenLifetime, // 刷新令牌有效期
        accessTokenLifetime: config.get('oAuth').accessTokenLifetime, // 授权令牌有效期
        grants: [ // 授权类型
            'password',
        ]
    };

    return return_json;
}

/**
 * 获取令牌(token)信息
 * @param {*} bearerToken 
 */
async function getAccessToken(bearerToken) {
    try {
        let token = await redis.hget(redisKey, bearerToken);

        if (!token) {
            token = null;
        }

        token = JSON.parse(token);
        if (token) {
            token.accessTokenExpiresAt = new Date(token.accessTokenExpiresAt); // 令牌的过期时间(Date类型)
            token.refreshTokenExpiresAt = new Date(token.refreshTokenExpiresAt); // 刷新令牌的过期时间(Date类型)
        }

        return token;
    } catch (err) {
        logger.error(`getAccessToken err: ${err.message}`);

        return null;
    }
}

/**
 * 获取用户信息
 * @param {*} username 小程序app_id
 * @param {*} password 小程序临时登录凭证code
 */
async function getUser(username, password) {
    try {
        // TODO 获取用户信息(没有即注册)

        // 返回用户信息（按需返回用户信息，都会存入token中）
        const return_json = {
            user_id: '测试demo',
            nick_name: '测试demo',
            real_name: '测试demo',
            head_pic: '测试demo',
            mobile: '测试demo',
            sex: '测试demo',
            relevace: '测试demo',
            ctime: new Date().getTime(),
        };

        return return_json;
    } catch (err) {
        if (err.errcode) {
            logger.error(`getUers errcode: ${err.errcode}, msg: ${err.errmsg}`);
        } else {
            logger.error(`getUers errcode: ${err.message}`);
        }

        return;
    }
}

/**
 * 保存令牌(token)信息
 * @param user 用户信息 getUser()中返回的数据
 * @param token 令牌信息
 * @param client 客户端信息
 */
async function saveToken(token, client, user) {
    const _token = Object.assign({}, { token, user, client });
    await redis.hset(redisKey, token.accessToken, JSON.stringify(_token));

    return _token;
}

/**
 * 获取刷新令牌信息
 * @param {*} params 
 */
async function getRefreshToken(params) {
    
}

/**
 * 移除刷新令牌
 */
async function revokeToken(params) {
    
}

/**
 * 权限验证validateScope(user, client, scope)
 */
module.exports = {
    getClient,
    getAccessToken,
    getUser,
    saveToken,
    getRefreshToken,
    revokeToken,
};