const {runBenchmarkService, createBenchmarkFromUrlService} = require('./service')

const runBenchmarkController = async (req, res) => {
	const { id:ieId } = req.body;
	const test = req.query.test === "true";

	const payload = await runBenchmarkService(ieId, test);

	res.json(payload);
}

const createBenchmarkFromUrlController = async (req, res) => {
	const url = req.body.url;

	if (!url) {
		return res.status(404).json({ error: 'It is not Geekbech url correct' });
	}

	const response = await createBenchmarkFromUrlService(url);

	res.json(response);
}

module.exports = {
	runBenchmarkController,
	createBenchmarkFromUrlController
}