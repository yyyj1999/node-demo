'use strict';
const config = require('config');
// const utils = require('../lib/utils');
const rediser = require('../lib/rediser');
const Thenjs = require('thenjs');
const appConf = config.get('app');

function init(callback) {
    // init http server
    Thenjs(function (cont) {
        cont();
        // Inject redis client
        rediser.init(config.get('redis'), function (err) {
            if (err) {
                cont(err);
            } else {
                console.log('redis is ready!');
                cont(null, null);
            }
        });
    }).then(function (cont) {
        // init http server
        const app = require('../app');
        const port = process.env.SERVICE_PORT || appConf.port;
        const server = app.listen(port, () => {
            console.log(`port: ${port}`);
            cont();
        });
        server.on('error', onError);
    }).fin(function (cont, err) {
        return callback(err);
    });
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
        console.log(`Error: ${JSON.stringify(err.stack || err)}`);
        return process.exit(-1);
    } else {
        console.info('Server is ready!');
    }
});

// Global Error handlers
process.on('uncaughtException', (err) => {
    const errMsg = {
        api: 100,
        msg: 'Global caught exception!',
        errStack: err.stack || err
    };

    console.log(`errMsg:${JSON.stringify(errMsg)}==`);
});