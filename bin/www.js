'use strict';

function init(callback) {
	// init http server
	const app = require('../app');
	const port = process.env.SERVICE_PORT || appConf.port;
	const server = app.listen(port, () => {
		console.log(`Startup ${appConf.name} in env ${process.env.NODE_ENV || 'development'} on port ${port}`);
		console.log(`Local Address is: ${utils.getServerLocalAddressAndPort()}`);
	});
	server.on('error', onError);
    
	return callback();
}

function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	// handle specific listen errors with friendly messages
	switch (error.code) {
	case 'EACCES':
		console.error(appConf.port + ' requires elevated privileges');
		process.exit(1);
		break;
	case 'EADDRINUSE':
		console.error(appConf.port + ' is already in use');
		process.exit(1);
		break;
	default:
		throw error;
	}
}

init(err => {
	if (err) {
		logger.error(`Error: ${JSON.stringify(err.stack || err)}`);
		return process.exit(-1);
	} else {
		logger.info('Server is ready!');
	}
});

// Global Error handlers
process.on('uncaughtException', (err) => {
	const errMsg = {
		api: 100,
		msg: 'Global caught exception!',
		errStack: err.stack || err
	};

	logger.error(`==code:${errCodes.GLOBAL_ERR}==errMsg:${JSON.stringify(errMsg)}==`);
});