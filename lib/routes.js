const _ = require('lodash');
const utils = require('./utils');

// 注册路由
const routers = {
	// 服务检测
	'/health': require('./router/heath'),
};

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

module.exports = {
	initRoute,
};