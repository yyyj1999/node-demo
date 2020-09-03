const router = require('express').Router();
const auth = require('../lib/auth/auth');
const utils = require('../lib/utils');

router.post('/token', async(req, res) => {
    const options = {};
    const result = auth.tokenHandler(req, res, options);
    
    res.json(utils.resJson(0, '', result));
});

router.post('/re-token', async(req, res) => {
    
});

module.exports = router;