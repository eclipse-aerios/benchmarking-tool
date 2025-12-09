const {runBenchmarkService} = require('./service')

const runBenchmarkController = async (req, res) => {
	const { id:ieId, remoteHostIp } = req.body;

	const test = req.query.test === "true";

	const payload = await runBenchmarkService(ieId, test);

	res.json(payload);
}

module.exports = {
	runBenchmarkController
}