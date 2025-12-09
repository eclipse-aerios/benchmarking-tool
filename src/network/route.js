const { Router } = require('express');
const { runBenchmarkController } = require('./controller');
const { checkRunningBenchmark } = require('./middleware')


const router = Router();

router.post('/', [checkRunningBenchmark], runBenchmarkController);

module.exports = router;