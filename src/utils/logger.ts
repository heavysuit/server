import winston from 'winston';

const { combine, errors, timestamp, json, simple, colorize } = winston.format;

export const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()],
  format:
    process.env.NODE_ENV === 'production'
      ? json()
      : combine(colorize(), simple(), timestamp(), errors({ stack: true })),
});
