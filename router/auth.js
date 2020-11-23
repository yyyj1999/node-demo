const router = require('express').Router();
const utils = require('../lib/utils');
const authService = require('../module/auth');

// 登录
router.post('/token', utils.reqHandler(async(req, res) => {
    const result = await authService.userLogin(req, res);
    
    res.json(utils.resJson(0, '', result));
}));

// 注册
router.post('/sign-up', utils.reqHandler(async(req, res) => {
    const requestData = {
        password: req.body.password,
        username: req.body.username,
    };
    const result = await authService.userSignOn(requestData);

    res.json(utils.resJson(0, '', result));
}));

module.exports = router;