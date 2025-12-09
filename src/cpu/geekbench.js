const axios = require('axios');
const cheerio = require('cheerio');
const { exec } = require('child_process');
const { orionLd, buildLogger } = require('../plugins')

const config = require('./config');
const logger = buildLogger('geekbench.plugin.js');
const { statusTypes } = require('../models/enums');

const runBenchmark = (id) =>  {
	logger.info(`BENCHMARKING TOOL | CPU | RUNNING | ID: ${id}`);
	config.isBenchMarkRunning = true;
	const entityBenchmark = config.results[id];

	exec('/opt/aerios/geekbench/geekbench6 --cpu', async (error, stdout, stderr) => {
			if (error || stderr) {
					logger.error(`BENCHMARKING TOOL | CPU | ERROR | Error running GeekBench for ID: ${id}, message: ${error.message}`);
					entityBenchmark.updateStatus(statusTypes.ERROR);
					entityBenchmark.addError(`Geekbench exited with an error - ${error.message}`);
					orionLd.update(entityBenchmark)
					resetCpuBenchmark()
					return;
			}

			const urlMatch = stdout.match(/https:\/\/browser\.geekbench\.com\/v6\/cpu\/\d+/);
			if (urlMatch) {
					logger.info(`BENCHMARKING TOOL | CPU | Online results available at: ${urlMatch} for ID: ${id}`);

					try {
							const benchmarkResults = await getBenchResultsFromUrl(urlMatch);

							entityBenchmark.updateData(benchmarkResults);
							entityBenchmark.updateStatus(statusTypes.FINISHED);
							logger.info(`BENCHMARKING TOOL | CPU | Results for ID: ${id}, Single-Core: ${benchmarkResults.scoreSingleCore}, Multi-Core: ${benchmarkResults.scoreMultiCore}`);
							logger.info(`BENCHMARKING TOOL | CPU | FINISHED | Benchmark completed for ID: ${id}`);

					} catch (error) {
							entityBenchmark.updateStatus(statusTypes.ERROR);
							entityBenchmark.addError(`Error getting GeekBench results - ${error.message}`);
							logger.error(`BENCHMARKING TOOL | CPU | ERROR | Error getting GeekBench results for ID: ${id}`);
					}

			} else {
					entityBenchmark.updateStatus(statusTypes.ERROR);
					entityBenchmark.addError('Could not get GeekBench results URL');
					logger.error(`BENCHMARKING TOOL | CPU | ERROR | Could not get results URL for ID: ${id}`);
			}

			orionLd.update(entityBenchmark)
			resetCpuBenchmark();
	});
}

// Get data from Geekbench URL
const getBenchResultsFromUrl = async (url) => {
	try {
			const response = await axios.get(url);
			const html = response.data;
			const $ = cheerio.load(html);
			return {...extractData($), url};
	} catch (error) {
			throw new Error(`Error getting GeekBench results | ${error}`);
	}
}

function extractSystemInfo($, label) {
	return $('td.system-value').filter((i, el) => {
			return $(el).prev().text().trim() === label;
	}).text().trim();
}

function extractTestResults($) {

	let results = [];
	const singleCoreResults = {};
	const multiCoreResults = {};

	// Extract data for Single-Core
	const singleCoreTable = $('div:contains("Single-Core Performance")').next('.table-wrapper').find('table.benchmark-table');
	extractDataTestResults($, singleCoreTable, singleCoreResults);

	// Extract data for Multi-Core
	const multiCoreTable = $('div:contains("Multi-Core Performance")').next('.table-wrapper').find('table.benchmark-table');
	extractDataTestResults($, multiCoreTable, multiCoreResults);

	results = {singleCoreResults, multiCoreResults}

	return results;
}

// Extract data from a table
function extractDataTestResults ($, table, resultObj) {
	table.find('tbody tr').each((_, element) => {
		const name = $(element).find('td.name').text().trim();
		const score = $(element).find('td.score').first().text().trim();
		resultObj[toCamelCase(name)] =  parseInt(score);
	});
};

function extractData($) {
	let data = {};

	data.title = $('h1').text().trim();

	// Main scores
	data.scoreSigleCore = $('.score-container-1 .score').text().trim();
	data.scoreMultiCore = $('.score-container:eq(1) .score').text().trim();

	// System information
	data.uploadDate= extractSystemInfo($, 'Upload Date');
	data.operatingSystem= extractSystemInfo($, 'Operating System');
	data.model= extractSystemInfo($, 'Model');
	data.motherboard= extractSystemInfo($, 'Motherboard');


	// Cpu information
	data.cpuName = extractSystemInfo($, 'Name');
	data.cpuTopology = extractSystemInfo($, 'Topology');
	data.cpuBaseFrequency = extractSystemInfo($, 'Base Frequency');

	// Single Core and Multi Core results
	data = {...data, ...extractTestResults($)};
	return data;
};


function toCamelCase(input) {
  return input
    .toLowerCase() 
    .split(' ') 
    .map((word, index) => 
      index === 0 
        ? word 
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('');
}

const resetCpuBenchmark = () => {
	config.isBenchMarkRunning = false;
	config.currentBenchMarkId = null;
}

module.exports = {
	runBenchmark,
	getBenchResultsFromUrl
}
