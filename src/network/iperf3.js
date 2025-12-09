const axios = require('axios');
const { exec } = require('child_process');
const { orionLd, buildLogger } = require('../plugins')

const config = require('./config');
const logger = buildLogger('network.iperf3.js');
const { statusTypes } = require('../models/enums');

const REMOTE_HOST_IP = process.env.ENTRYPOINT_HOST_IP;

const runBenchmark = async (id) => {
    logger.info(`BENCHMARKING TOOL | Network | RUNNING | ID: ${id}`);
    config.isBenchMarkRunning = true;
    const entityBenchmark = config.results[id];

    try {
        // Ejecutar pruebas TCP y UDP
        const tcpResult = await runIperfTest(id, REMOTE_HOST_IP, false); // Test TCP
        const udpResult = await runIperfTest(id, REMOTE_HOST_IP, true);  // Test UDP

        const combinedResults = {
            info: {
                date: tcpResult.start.timestamp,
                systemInfo: tcpResult.start.system_info,
                version: tcpResult.start.version
            },
            tests: [
                formatTestResult('TCP', tcpResult),
                formatTestResult('UDP', udpResult)
            ]
        };

        entityBenchmark.updateData(combinedResults);
        entityBenchmark.updateStatus(statusTypes.FINISHED);
        logger.info(`BENCHMARKING TOOL | Network | FINISHED | Benchmark completed for ID: ${id}`);

    } catch (error) {
        entityBenchmark.updateStatus(statusTypes.ERROR);
        entityBenchmark.addError(`Error running benchmark tests - ${error.message}`);
        logger.error(`BENCHMARKING TOOL | Network | ERROR | Error running benchmarks for ID: ${id}, message: ${error.message}`);
    }

    orionLd.update(entityBenchmark);
    resetNetworkBenchmark();
};

const runIperfTest = (id, remoteHostIp, isUdp) => {
    return new Promise((resolve, reject) => {
        const upd_params = isUdp ? '-u' : '';
        const protocol = isUdp ? 'UDP' : 'TCP';
        logger.info(`BENCHMARKING TOOL | Network | ${protocol} | START | ID: ${id}`);
        const command = `/usr/bin/iperf3 -c ${remoteHostIp} -J ${upd_params}`;
        
        exec(command, (error, stdout, stderr) => {
            if (error || stderr) {
                logger.error(`BENCHMARKING TOOL | Network | ERROR | Error running iperf3 for ID: ${id}, message: ${error.message || stderr}`);
                reject(new Error(`iperf3 exited with an error - ${error.message || stderr}`));
                return;
            }

            try {
                const resultJson = JSON.parse(stdout);
                resolve(resultJson);
                logger.info(`BENCHMARKING TOOL | Network | ${protocol} | END | ID: ${id}`);
            } catch (error) {
                reject(new Error(`Error parsing iperf3 results - ${error.message}`));
            }
        });
    });
};

// Función para formatear los resultados
const formatTestResult = (connectionType, resultJson) => {
    let sumDuration = 0;
    let sumBps = 0;
    let sumRtt = 0;
    let sumRttVar = 0;
    let sumPmtu = 0;
    let count = 0;

    if (resultJson.intervals) {
        resultJson.intervals.forEach(interval => {
            const bps = interval.sum.bits_per_second;
            sumBps += bps;
            count++;
            sumDuration += interval.sum.seconds; // duración en cada intervalo
            
            // Extraer RTT y RTTVAR por stream, si existen
            if (interval.streams && resultJson.start.test_start.protocol === 'TCP') {
                interval.streams.forEach(stream => {
                  sumRtt += stream.rtt;
                  sumRttVar += stream.rttvar;
                  sumPmtu += stream.pmtu;
                });
            }
        });
    }

    const avgDuration = sumDuration / count;
    const avgBps = sumBps / count;
    const avgRtt = count > 0 ? sumRtt / count : null;
    const avgRttVar = count > 0 ? sumRttVar / count : null;
    const avgPmtu = count > 0 ? sumPmtu / count : null;

    return {
        conectionType: connectionType,
        mediaDuration: `${avgDuration}s`,
        mediaBps: `${convertToMbps(avgBps)} Mbps`,
        ...(avgRtt && { mediaRtt: `${avgRtt} ms` }),
        ...(avgRttVar && { mediaRttVar: `${avgRttVar} ms` }),
        ...(avgPmtu && { mediaPmtu: `${avgPmtu} ms` })
    };
};

const convertToMbps = (bps) => {
    return bps / 1000000;
};

const resetNetworkBenchmark = () => {
    config.isBenchMarkRunning = false;
    config.currentBenchMarkId = null;
};

module.exports = {
    runBenchmark
};
