import winston from 'winston';

const { combine, errors, prettyPrint, timestamp, json } = winston.format;

export const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()],
  format:
    process.env.NODE_ENV === 'production'
      ? json()
      : combine(timestamp(), errors({ stack: true }), prettyPrint()),
});
