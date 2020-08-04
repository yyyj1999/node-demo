const Senv = require('../lib/senv');

async function heath(){
	const Senv = new Senv();
	return {
		a: 1,
		b: 2,
	};
}

module.exports = {
	heath,
};