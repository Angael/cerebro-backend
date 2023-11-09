import { format, createLogger, transports } from 'winston';

const timeAndPrintf = format.combine(
  format.splat(),
  format.timestamp({
    format: 'YY-MM-DD HH:mm:ss.SSS',
  }),
  format.printf((info) => `[${info.timestamp}]  [${info.level}] : ${info.message}`),
);

export const logger = createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), timeAndPrintf),
    }),
    new transports.File({
      filename: 'logs/info.log',
      level: 'info',
      format: timeAndPrintf,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new transports.File({
      filename: 'logs/exceptions.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

export default logger;
