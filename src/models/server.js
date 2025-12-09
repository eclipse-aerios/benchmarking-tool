const express = require('express')
const cors = require('cors');
const { buildLogger } = require('../plugins');
const logger = buildLogger('server.js');

class Server {

	constructor() {
		this.app = express();
		this.port = process.env.PORT || 3000;
		this.paths = {
			cpu: '/benchmark/v1/cpu',
			network: '/benchmark/v1/network',
		}
		this.middleWares();
		this.routes();
	}

	routes() {
		this.app.use(this.paths.cpu, require('../cpu/route'));
		this.app.use(this.paths.network, require('../network/route'));
	}

	middleWares() {
		// Cors
		this.app.use(cors());

		// Get and parse of Body
		this.app.use(express.json());

		// // Public path
		// this.app.use(express.static('public'));
	}

	listen() {
		this.app.listen(this.port, () => {
			logger.info(`BENCHMARKING TOOL | Server start on port: ${this.port}`);
		})
	}
}

module.exports = Server;