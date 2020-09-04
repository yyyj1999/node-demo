'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const router = require('./lib/routes');
const app = express();
const utils = require('./lib/utils');
const expressSwagger = require('express-swagger-generator')(app);

app.use(express.static('public'));
app.use(express.static('static'));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.raw({ limit: '10mb' }));
const localAddress = utils.getServerLocalAddressAndPort();

// 跨域访问配置
app.all('*', function (req, res, next) {
    const origin = req.headers.origin;
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
    req.localAddress = localAddress;
    next();
});

// swagger生成api文档
const options = {
    swaggerDefinition: {
        info: {
            description: 'This is a sample server',
            title: 'Swagger',
            version: '1.0.0'
        },
        host: 'localhost:8080',
        basePath: '/',
        produces: ['application/json', 'application/xml'],
        schemes: ['http', 'https'],
        securityDefinitions: {
            JWT: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
                description: ''
            }
        }
    },
    route: {
        url: '/swagger',
        docs: '/swagger.json' // swagger文件 api
    },
    basedir: __dirname, // app absolute path
    files: ['./router/*.js'] // Path to the API handle folder
};
expressSwagger(options);

// 注册路由
router.initRoute(app);

module.exports = app;