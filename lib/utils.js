const os = require('os');
const _ = require('lodash');

function resJson(code, msg, data){
    return {
        code,
        msg,
        data,
    };
}

function getServerLocalAddressAndPort() {
    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var ad = interfaces[k][k2];
            if (ad.family === 'IPv4' && !ad.internal) {
                addresses.push(ad.address);
            }
        }
    }
    var ip = _.isEmpty(addresses) ? '127.0.0.1' : addresses[0];
    var port = process.env.SERVICE_PORT || 8156;
    return ip + ':' + port;
}

/**
 * API统一错误处理
 */
function reqHandler(fun) {
    return async (req, res) => {
        try {
            await fun(req, res);
        } catch (err) {
            const errMsg = Object.assign(req.errMsg || {}, {
                logLevel: 'error',
                errStack: err.stack || err,
            });
            // const resJson = resJSON_FULL_LOG;                               // 生成返回信息
            if (err.isJoi) { // 参数验证错误
                return res.json(resJson(1000, 'PARAM_ERR', {}, errMsg));
            }

            return res.json(resJson(0, err.message || err || '内部错误', {}, errMsg));
        }
    };
}

module.exports = {
    resJson,
    getServerLocalAddressAndPort,
    reqHandler,
};