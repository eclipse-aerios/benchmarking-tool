const axios = require('axios');
const buildLogger = require('./logger.plugin');

const Authorization = require('./authorization.plugin');

const logger = buildLogger('orionld.plugin.js');
const ORION_URL = process.env.ORION_URL;

const requestMethod = {
	POST: 'POST',
	PUT: 'PUT'
};

const requestOptions = {
	method: requestMethod.POST,
	headers: {
		'Content-Type': 'application/json',
	}
};

const save = async (payload) => {
	let response = '';
	const url = `${ORION_URL}/ngsi-ld/v1/entities/`;
	const benchmarkType = payload.category.value;

	const token = await Authorization.getToken();
	requestOptions.headers['Authorization'] = `Bearer ${token}`;
	
	try {
		response = await axios.post(`${url}`, payload, requestOptions);
	} catch (error) {
		logger.debug(`BENCHMARKING TOOL | ${benchmarkType} | OrionLD | Connection error: ${url} - ${error.stack}`);
		throw new Error(`OrionLD connection error:${url} - ${error.message}`);
	}
	
	if (response.status != 201) {
		throw new Error(`Error saving OrionLD: ${response.data}`);
	}
	
	logger.info(`BENCHMARKING TOOL | ${benchmarkType} | OrionLD | Entity created successfully for ID: ${payload.id}`);
	return payload.id;
}

const update = async (payload) => {
	let response = '';
	const url = `${ORION_URL}/ngsi-ld/v1/entities/${payload.id}`;
	const benchmarkType = payload.category.value;
	
	const token = await Authorization.getToken();
	requestOptions.headers['Authorization'] = `Bearer ${token}`;
	requestOptions.method = requestMethod.PUT;

	try {
		response = await axios.put(`${url}`, payload, requestOptions);
	} catch (error) {
		logger.debug(`BENCHMARKING TOOL | ${benchmarkType} | OrionLD | Connection error: ${url} - ${error.stack}`);
		throw new Error(`OrionLD connection error:${url} - ${error.message}`);
	}

	if (response.status != 204) {
			throw new Error(`Error updating Orion: ${url} - ${response.data}`);
	}

	logger.info(`BENCHMARKING TOOL | ${benchmarkType} | OrionLD | Entity updated successfully for ID: ${payload.id}`);
	return payload.id;
}

module.exports = {
	save,
	update
}