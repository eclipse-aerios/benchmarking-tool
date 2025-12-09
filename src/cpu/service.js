const { orionLd, buildLogger } = require('../plugins')
const { v4: uuidv4 } = require('uuid');
const { runBenchmark, getBenchResultsFromUrl } = require('./geekbench')
const EntityBenchmark = require('../models/entityBenchmark');
const { categoryTypes, statusTypes } = require('../models/enums');

const config = require('./config');
const logger = buildLogger('cpu.service.js');

const runBenchmarkService = async (infrastructureElementId, test) => {
	const id = uuidv4();

	const entityBenchmark = new EntityBenchmark(id, categoryTypes.CPU, infrastructureElementId);

	config.results[entityBenchmark.id] = entityBenchmark;
	config.currentBenchMarkId = entityBenchmark.id;

	try {
		const benchMarkId = await orionLd.save(entityBenchmark);

		if (test) {
			const payloadInitial = structuredClone(entityBenchmark);
			const url = 'https://browser.geekbench.com/v6/cpu/7286876'
			const benchmarkResults = await getBenchResultsFromUrl(url);

			if (!benchmarkResults) {
				throw new Error('Error getting GeekBench results');
			}

			entityBenchmark.updateStatus(statusTypes.FINISHED);
			entityBenchmark.updateData(benchmarkResults);

			await orionLd.update(entityBenchmark);
			return payloadInitial;
		}

		runBenchmark(benchMarkId);
		return entityBenchmark;
	} catch (error) {
		logger.error(`BENCHMARKING TOOL | CPU | ID: ${id} | ${error.message}`);
	}

}

const createBenchmarkFromUrlService = async (url) => {
	const id = uuidv4();
	try {
		logger.info(`BENCHMARKING TOOL | CPU | createBenchmarkFromUrlService | Get data of Geekbench from URl: ${url} to ID: ${id}`);

		const benchmarkResults = await getBenchResultsFromUrl(url);

		const entityBenchmark = new EntityBenchmark(id, categoryTypes.CPU);
		entityBenchmark.data.value = benchmarkResults;

		logger.info(`BENCHMARKING TOOL | CPU | createBenchmarkFromUrlService | Results extracted for ID: ${id}, Single-Core: ${benchmarkResults.scoreSigleCore}, Multi-Core: ${benchmarkResults.scoreMultiCore}`);

		orionLd.save(entityBenchmark);

		return entityBenchmark;

	} catch (error) {
		logger.error(`BENCHMARKING TOOL | CPU | createBenchmarkFromUrlService | Error getting GeekBench results for ID: ${id} | Message: ${error.message}`);
	}
}

module.exports = {
	runBenchmarkService,
	createBenchmarkFromUrlService
}