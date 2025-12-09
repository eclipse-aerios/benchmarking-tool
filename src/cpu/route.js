const { Router } = require('express');
const { runBenchmarkController, createBenchmarkFromUrlController } = require('./controller');
const { checkRunningBenchmark } = require('./middleware')


const router = Router();

router.post('/', [checkRunningBenchmark], runBenchmarkController);
router.post('/createBenchmarkFromGeekbenchUrl', createBenchmarkFromUrlController);

module.exports = router;