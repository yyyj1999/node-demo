const router = require('express').Router();
const utils = require('../lib/utils');
const authService = require('../module/auth');

// 登录
router.post('/token', async(req, res) => {
    const result = await authService.userLogin(req, res);
    
    res.json(utils.resJson(0, '', result));
});

// router.post('/re-token', async(req, res) => {
    
// });

module.exports = router;