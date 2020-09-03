const request = require('request');
// const _ = require('lodash');
const logger = require('../logger');
// const clients = require('./client.json'); // 客户端信息(小程序)
const IntelligetnMarketing = require('../utils/IntelligetnMarketing');
/**
 * 数据库
 */
const mongodber = require('../utils/mongodber');
const bookonline_db = mongodber.use('bookonline');

/**
 * 获取客户端信息
 * @param {*} client 客户端编号
 * @param {*} secret 客户端验证密钥
 */
async function getClient(client, secret) {

    const where = {
        clientid: client,
        client_secret: secret
    };
    const client_info = await bookonline_db.collection('merchant_app').findOne(where);
    if (!client_info) {
        return;
    }

    // 重组数据
    const return_json = {
        // redirectUris: [],                // 授权模式指向url
        // refreshTokenLifetime: 4332000, // 刷新令牌有效期
        // accessTokenLifetime: 4332000, // 授权令牌有效期
        grants: [ // 授权类型
            'password',
            'wx_login',
            'intell_pwd',
        ]
    };

    return return_json;
}

/**
 * 验证令牌(token)信息
 * @param {*} bearerToken 
 */
async function getAccessToken(bearerToken) {
    try {
        let token = await bookonline_db.collection('wx_tokens').findOne({ accessToken: bearerToken });

        if (!token) {
            token = null;
        }

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
        // 获取客户端信息
        // const client_info = _.find(clients, (o) => {
        //     return o.weChat.appId === username;
        // });

        // if (!client_info) {
        //     return;
        // }

        const where = {
            'config.app_id': username
        };
        const app_info = await bookonline_db.collection('merchant_app').findOne(where);
        if (!app_info) {
            return;
        }
    
        // 重组数据
        const client_info = {
            clientId: app_info.clientid,
            clientSecret: app_info.client_secret,
            name: app_info.name,
            redirectUris: [],
            refreshTokenLifetime: 4332000,
            accessTokenLifetime: 4332000,
            application_id: app_info.application_id,
            merchant_id: app_info.merchant_id,
            type: app_info.type,
            weChat: {
                appId: app_info.config.app_id,
                secret: app_info.config.app_secret
            },
            grants: [
                'password',
                'wx_login'
            ]
        };

        // 设置授权类型
        let reg_type = 'wx_login';
        switch (client_info.type) {
        case 'wx_app':
            reg_type = 'wx_login';
            break;
        default:
            break;
        }

        // 通过code获取微信用户open_id以及union_id
        const code_url = `https://api.weixin.qq.com/sns/jscode2session?appid=${username}&secret=${client_info.weChat.secret}&js_code=${password}&grant_type=authorization_code`;
        const code_info = await new Promise((resolve, reject) => {
            request({
                method: 'GET',
                url: code_url,
                json: true
            }, (err, res, body) => {
                if (err) {
                    reject(err);
                }

                if (body) {
                    if (body.errcode && body.errcode !== 0) {
                        reject(body);
                    } else {
                        resolve(body);
                    }
                }
            });
        });

        // 获取用户信息(没有时自动注册)
        const user_auths_where = {
            login_type: reg_type,
            identifier: username,
            credential: code_info.openid,
        };
        let auth_info = await bookonline_db.collection('wx_user_auths').findOne(user_auths_where);
        let user_info = null;
        if (!auth_info) {  // 新增用户
            // 获取自增编号
            const ids = await IntelligetnMarketing.getSeqs('bookonline', 'counters', 'wx_users', 1);
            if (ids.length === 0) {
                return;
            }

            user_info = {
                _id: ids[0], // 用户编号
                nick_name: '', // 昵称
                real_name: '', // 真实姓名
                head_pic: '', // 头像
                email: '', // 个人邮箱
                mobile: '', // 绑定手机号
                sex: 'x', // 性别 b g x
                reg_type, // 注册类型  'password'  'wx_login' 'qq_login' 'hfs_login'
                relevace: [], // 关联账号
                source_client: app_info.clientid, 
                status: 1, // 状态，0、无效 1、有效
                utime: new Date(), // 最后一次修改时间
                ctime: new Date(), // 创建时间
            };
            bookonline_db.collection('wx_users').insertOne(user_info, (err) => {
                if (err) {
                    logger.error(`新增用户信息失败: ${err}`);
                }
            });

            // 新增用户认证
            const user_auth_info = {
                user_id: ids[0], // 绑定用户编号
                login_type: reg_type, // 登录类型 'wx_login'
                identifier: username, // 唯一标识 'appid'
                credential: code_info.openid, // 凭证 'openid'
                expand: {
                    union_id: code_info.unionid || null,
                },
                ctime: new Date(), // 绑定时间
            };
            bookonline_db.collection('wx_user_auths').insertOne(user_auth_info, (err) => {
                if (err) {
                    logger.error(`新增用户认证失败, 用户编号: ${user_auth_info.user_id}`);
                }
            });
        } else {
            // 获取用户信息
            user_info = await bookonline_db.collection('wx_users').findOne({ _id: auth_info.user_id, status: 1 });
        }

        if (!user_info) {
            // 未找到该用户信息
            return;
        }

        // 返回用户信息
        const return_json = {
            user_id: user_info._id,
            nick_name: user_info.nick_name,
            real_name: user_info.real_name,
            head_pic: user_info.head_pic,
            mobile: user_info.mobile,
            sex: user_info.sex,
            relevace: user_info.relevace,
            ctime: user_info.ctime.getTime(),
        };

        // 扩展信息
        if (client_info.type === 'wx_app') {
            // 微信用户扩展信息
            return_json.wechat = {
                app_id: username,
                openid: code_info.openid || '',
                union_id: code_info.unionid || '',
                session_key: code_info.session_key || '',
            };
        }

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
    const _token = Object.assign({}, token, { user }, { client });
    _token._id = user.user_id;
    await bookonline_db.collection('wx_tokens').save(_token);

    delete _token._id;

    return _token;
}

module.exports = {
    getClient,
    getAccessToken,
    getUser,
    saveToken
};