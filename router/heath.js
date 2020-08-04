const router = require('express').Router();
const heathService = require('../module/heath');
const utils = require('../lib/utils');

router.get('/', async(req, res) => {
	const result = heathService.heath();
	return res.json(utils.resJson(0, '', result));
});

module.exports = router;