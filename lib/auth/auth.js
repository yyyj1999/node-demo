const model = require('./model');
const oauthServer = require('oauth2-server');
const Request = oauthServer.Request;
const Response = oauthServer.Response;
const utils = require('../utils');
const config = require('config');

// 
const oauth = new oauthServer({
    model: model,
    authenticateHandler: {
        handle: async function (req) {
            const user = await model.getUser(req.body.username, req.body.password);

            return user;
        }
    },
    allowEmptyState: true,
    accessTokenLifetime: 3600, // 
});

/**
 * 授权请求(暂时不用)
 */
function authorizeHandler(req, res, options) {
    let request = new Request(req);
    let response = new Response(res);

    return oauth.authenticate(request, response, options)
        .then((code) => {
            console.log(code);
            res.json(utils.resJson(0, '', { code }));
        }).catch((err) => {
            res.json(utils.resJson(errHandler(err.name), {
                error: err.name,
                error_description: err.message,
            }, {}));
        });
}

/**
 * 验证token
 */
function authenticateHandler(req, res, next) {
    let request = new Request(req);
    let response = new Response(res);

    return oauth.authenticate(request, response)
        .then((code) => {
            req.wx_auth = code;
            next();
        }).catch((err) => {
            res.json(utils.resJson(errHandler(err.name), {
                error: err.name,
                error_description: err.message,
            }, {}));
        });
}

/**
 * 生成token
 */
function tokenHandler(req, res, options) {
    let request = new Request(req);
    let response = new Response(res);

    return oauth.token(request, response, options)
        .then((token) => {
            res.locals.oauth = { token: token };
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'accept, content-type, x-parse-application-id, x-parse-rest-api-key, x-parse-session-token');
            console.log(token.accessTokenExpiresAt);
            const data = {
                'accessToken': token.accessToken,   // 授权令牌     
                'tokenType': 'Bearer',     // 令牌类型
                'expiresIn': config.get('oAuth').refreshTokenLifetime, // 令牌有效期
                'refreshToken': token.refreshToken // 刷新令牌
            };

            return data;
        }).catch((err) => {
            res.json(utils.resJson(errHandler(err.name), {
                error: err.name,
                error_description: err.message,
            }, {}));
        });
}

/**
 * 刷新token
 */
function tokenReHandler(req, res, next) {
    let request = new Request(req);
    let response = new Response(res);

    return oauth.authenticate(request, response)
        .then((code) => {
            req.wx_auth = code;
            next();
        }).catch((err) => {
            res.json(utils.resJson(errHandler(err.name), {
                error: err.name,
                error_description: err.message,
            }, {}));
        });
}

/**
 * 错误处理
 */
function errHandler(name) {
    let code = 0;
    switch (name) {

    case 'invalid_request': code = 1000; break;// 请求错误，重新获取token
    case 'invalid_token': code = 1000; break;
    case 'invalid_grant': code = 1001; break;// 账号或密码错误
    case 'redirect_uri_mismatch': code = 1002; break;
    case 'invalid_client': code = 1003; break;
    case 'unauthorized_client': code = 1004; break;
    case 'unauthorized_request': code = 1005; break;
    case 'expired_token': code = 1005; break;
    case 'unsupported_grant_type': code = 1006; break;
    case 'unsupported_response_type': code = 1007; break;
    case 'access_denied': code = 1008; break;
    case 'temporarily_unavailable': code = 1009; break;
    default: break;
    }

    return code;
}

module.exports = {
    authorizeHandler,
    tokenHandler,
    authenticateHandler,
    tokenReHandler,
};

