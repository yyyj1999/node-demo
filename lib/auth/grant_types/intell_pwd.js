'use strict';

/**
 * Module dependencies.
 */

const AbstractGrantType = require('oauth2-server/lib/grant-types/abstract-grant-type');
const InvalidArgumentError = require('oauth2-server/lib/errors/invalid-argument-error');
const InvalidGrantError = require('oauth2-server/lib/errors/invalid-grant-error');
const is = require('oauth2-server/lib/validator/is');
const util = require('util');
const utility = require('utility');

const mongodber = require('../../utils/mongodber');
const bookonline_db = mongodber.use('bookonline');

/**
 * Constructor.
 */

function IntellPasswordGrantType(options) {
    options = options || {};
    AbstractGrantType.call(this, options);
}

/**
 * Inherit prototype.
 */

util.inherits(IntellPasswordGrantType, AbstractGrantType);

IntellPasswordGrantType.prototype.handle = async function (request, client) {
    if (!request) {
        throw new InvalidArgumentError('Missing parameter: `request`');
    }

    if (!client) {
        throw new InvalidArgumentError('Missing parameter: `client`');
    }

    const scope = this.getScope(request);

    const user = await this.getUser(request.body.username, request.body.password);

    if (!user) {
        throw new InvalidGrantError('Bad username or password');
    }

    return this.saveToken(user, client, scope);
};

/**
 * Get user using a username/password combination.
 */

IntellPasswordGrantType.prototype.getUser = async function (username, password) {

    const user_auths_where = {
        login_type: 'intell_pwd',
        identifier: username,
        credential: utility.md5(password),
    };
    const user_auths_options = { user_id: 1, _id: 0 };
    const user_auths_info = await bookonline_db.collection('wx_user_auths').findOne(user_auths_where, user_auths_options);

    if (!user_auths_info || user_auths_info.user_id <= 0) {
        return;
    }
    // 获取用户信息
    const users_where = {
        _id: user_auths_info.user_id,
        status: 1,
    };
    const users_options = {};
    const users_info = await bookonline_db.collection('wx_users').findOne(users_where, users_options);
    if (!users_info) {
        return;
    }

    // todo 增加商户信息

    const return_json = {
        user_id: user_auths_info.user_id,
        nick_name: users_info.nick_name,
        real_name: users_info.real_name,
        head_pic: users_info.head_pic,
        mobile: users_info.mobile,
        sex: users_info.sex,
        wechat: {},
        relevace: users_info.relevace,
        ctime: users_info.ctime.getTime(),
    };
    return return_json;
};

/**
 * Save token.
 */

IntellPasswordGrantType.prototype.saveToken = async function (user, client, scope) {

    if (user) {
        const scopes = await this.validateScope(user, client, scope);
        const accessToken = await this.generateAccessToken(client, user, scope);
        const refreshToken = await this.generateRefreshToken(client, user, scope);
        const accessTokenExpiresAt = await this.getAccessTokenExpiresAt();
        const refreshTokenExpiresAt = await this.getRefreshTokenExpiresAt();
        const token = {
            accessToken,
            accessTokenExpiresAt,
            refreshToken,
            refreshTokenExpiresAt,
            scope: scopes,
        };

        const _token = Object.assign({}, token, { user }, { client });
        _token._id = user.user_id;
        await bookonline_db.collection('wx_tokens').save(_token);
        delete _token._id;
        return _token;
    }

    return null;
};

/**
 * Export constructor.
 */

module.exports = IntellPasswordGrantType;
