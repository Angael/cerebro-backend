import { format, createLogger, transports } from 'winston';

const alignColorsAndTime = format.combine(
  format.colorize({
    all: true,
  }),
  format.timestamp({
    format: 'YY-MM-DD HH:mm:ss.SSS',
  }),
  format.printf(
    (info) => `[${info.timestamp}]  [${info.level}] : ${info.message}`,
  ),
);

export const logger = createLogger({
  level: 'debug',
  transports: [
    new transports.Console({
      format: format.combine(
        format.splat(),
        format.colorize(),
        alignColorsAndTime,
      ),
    }),
  ],
});

export default logger;
