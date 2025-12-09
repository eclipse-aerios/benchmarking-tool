const { orionLd, buildLogger } = require('../plugins')
const { v4: uuidv4 } = require('uuid');
const { runBenchmark } = require('./iperf3');
const EntityBenchmark = require('../models/entityBenchmark');
const { categoryTypes, statusTypes } = require('../models/enums');

const config = require('./config');
const logger = buildLogger('network.service.js');

const runBenchmarkService = async (infrastructureElementId, test) => {
	const id = uuidv4();

	const entityBenchmark = new EntityBenchmark(id, categoryTypes.NETWORK, infrastructureElementId);

	config.results[entityBenchmark.id] = entityBenchmark;
	config.currentBenchMarkId = entityBenchmark.id;

	try {
		const benchMarkId = await orionLd.save(entityBenchmark);

		runBenchmark(benchMarkId);
		return entityBenchmark;
	} catch (error) {
		logger.error(`BENCHMARKING TOOL | Network | ID: ${id} | ${error.message}`);
	}

}

module.exports = {
	runBenchmarkService
}