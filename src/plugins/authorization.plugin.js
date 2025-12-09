const axios = require('axios');
const buildLogger = require('./logger.plugin');

const logger = buildLogger('authorizacion.plugin.js');
const HLO_COMPONENTS_SHIM_URL = process.env.HLO_COMPONENTS_SHIM_URL || 'http://aerios-k8s-shim-service.default.svc.cluster.local:8085';

const getToken = async () => {
  let response = '';
  const url = `${HLO_COMPONENTS_SHIM_URL}/token/cb`;
  
  try {
    response = await axios.get(`${url}`);
  } catch (error) {
    logger.debug(`BENCHMARKING TOOL | GET_TOKEN | Connection error: ${url} - ${error.stack}`);
    throw new Error(`Error getting token: ${url} - ${error.message}`);
  }
  
  if (response.status != 200) {
      throw new Error(`Error getting token: ${url} | Response status is ${response.status} and should be 200`);
  }
  
  logger.debug(`BENCHMARKING TOOL | GET_TOKEN | token: ${response.data.token}`);
  return response.data.token;
}

module.exports = {
	getToken
}