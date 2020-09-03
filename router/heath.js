const router = require('express').Router();
const heathService = require('../module/heath');
const utils = require('../lib/utils');
const auth = require('../lib/auth/auth');

router.get('/', [auth.authenticateHandler], async(req, res) => {
    const result = heathService.heath();
    return res.json(utils.resJson(0, '', result));
});

module.exports = router;