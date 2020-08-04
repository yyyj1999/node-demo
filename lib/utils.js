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
			if (ad.family === 'IPv4' && !ad['internal']) {
				addresses.push(ad.address);
			}
		}
	}
	var ip = _.isEmpty(addresses) ? '127.0.0.1' : addresses[0];
	var port = process.env.SERVICE_PORT || 8156;
	return ip + ':' + port;
}

module.exports = {
	resJson,
	getServerLocalAddressAndPort
};