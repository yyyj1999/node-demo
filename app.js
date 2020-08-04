'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
// const config = require('config');
const app = express();
const utils = require('./lib/utils');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.raw({ limit: '10mb' }));
const localAddress = utils.getServerLocalAddressAndPort();

// 跨域访问配置
app.all('*', function (req, res, next) {
	const origin = req.headers['origin'];
	res.header('Access-Control-Allow-Origin', origin);
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,PATCH,OPTIONS');
	res.header('X-Powered-By', ' 3.2.1');
	res.header('Content-Type', 'application/json;charset=utf-8');
	next();
});

// 访问IP
app.all('*', function (req, res, next) {
	req.realIP = req.header('X-Real-IP') || req.ip;
	req['localAddress'] = localAddress;
	next();
});

// 注册路由
const routers = {
	// 服务检测
	'/health': require('./router/heath'),
};
initRoute(app);

function initRoute(app) {
	// 处理所有URL
	_.each(routers, function (action, path) {
		app.use(path, action);
	});

	// catch 404 and forward to
	app.use(function (req, res, next) {
		const err = new Error('Not Found');
		err.status = 404;
		next(err);
	});

	// catch 500 internal error handler
	app.use(function (err, req, res) {
		res.status(err.status || 500);

		if (err.status == 404) {
			return res.json(utils.resJson(404, 'Not Found', null));
		}
        
		return res.json(utils.resJson(1000, '内部错误',  null));
	});
}

module.exports = app;