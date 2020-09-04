const router = require('express').Router();
const auth = require('../lib/auth/auth');
const utils = require('../lib/utils');

/**
 * 登录
 * @route POST /auth/token
 * @group user
 * @param {string} username.body.required - 用户名
 * @param {string} password.body.required - 密码
 * @returns {object} 
 */
router.post('/token', async(req, res) => {
    const options = {};
    const result = auth.tokenHandler(req, res, options);
    
    res.json(utils.resJson(0, '', result));
});

// router.post('/re-token', async(req, res) => {
    
// });

module.exports = router;