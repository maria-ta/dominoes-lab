import * as winston from 'winston';

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  defaultMeta: {},
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `debug` or less to `debug.log`
    //
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
      format: winston.format.simple(),
    }),
    new winston.transports.File({
      filename: 'debug.log',
      format: winston.format.simple(),
    }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
      level: 'info',
    }),
  );
}

export default logger;
