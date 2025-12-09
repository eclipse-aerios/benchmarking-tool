const { buildLogger } = require('../plugins')
const config = require('./config');

const logger = buildLogger('network.middleware.js');

const checkRunningBenchmark = (req, res, next) => {
	if (config.isBenchMarkRunning) {
			logger.warn(`BENCHMARKING TOOL | Network | A benchmark is already in progress with ID: ${config.currentBenchMarkId}`);

			config.results[config.currentBenchMarkId].status.value = 'running';

			res.json(config.results[config.currentBenchMarkId]);
			return;
	}
	next();
}

module.exports = {
	checkRunningBenchmark
}