let md5 = require('md5');
let querystring = require('querystring');
// 生成thqs加密数据
function encryptTHQS(query, salt, method) {
    let time = Date.now();

    let ordered = {};
    Object.keys(query).sort().forEach(function (key) {
        ordered[key] = query[key];
    });

    ordered.time = time;
    ordered.salt = salt;

    let url = querystring.stringify(ordered);
    let hash = md5(url).toUpperCase();

    delete ordered.salt;
    ordered.hash = hash;
    if (method === 'get') {
        return querystring.stringify(ordered);
    } else if (method === 'post') {
        return ordered;
    } else {
        throw new Error('method only support get or post');
    }

}
let a = encryptTHQS({
    'customer_id': '5e7a0dde0000023a7e40792b',      // 上课平台商户 id, 必须
    'room_id': '000000000000000000001439',          // 房间 id, 必须
}, 'xuVDzJIx2azWFmWZ6MjGPOFC7ieeHLIf', 'get');
console.log(a);