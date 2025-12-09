const winston = require('winston');
const { combine, timestamp, json } = winston.format;

const LOGGER_LEVEL = process.env.LOGGER_LEVEL || 'info';

// Formato personalizado para incluir fecha, hora y milisegundos en consola
const customFormat = winston.format.printf(({ level, message, timestamp, service }) => {
  return `${timestamp} [${level.toUpperCase()}] (${service}): ${message}`;
});

const logger = winston.createLogger({
  level: LOGGER_LEVEL,
  format: combine(
    timestamp(),
    json(),
  ),
  // defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or higher to `error.log`
    //   (i.e., error, fatal, but not other levels)
    //
    new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
    //
    // - Write all logs with importance level of `info` or higher to `combined.log`
    //   (i.e., fatal, error, warn, and info, but not trace)
    //
    new winston.transports.File({ filename: './logs/combined.log' }),
    // new winston.transports.Console({
    //   format: winston.format.simple(), // Esto hace que los logs sean más legibles en consola
    // }),
  ],
});

logger.add(new winston.transports.Console({
  format: combine(
    timestamp(),
    customFormat
  ),
}));

module.exports = function buildLogger(service) {
  return {
    error: (message) => {
      logger.error({ message, service });
    },
    warn: (message) => {
      logger.warn({ message, service });
    },
    info: (message) => {
      logger.info({ message, service });
    },
    http: (message) => {
      logger.http({ message, service });
    },
    verbose: (message) => {
      logger.verbose({ message, service });
    },
    debug: (message) => {
      logger.debug({ message, service });
    },
    silly: (message) => {
      logger.silly({ message, service });
    },
  };
};