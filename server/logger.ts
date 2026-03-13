import winston from 'winston';
import path from 'path';
import { mkdirSync, existsSync } from 'fs';
import type { Request, Response, NextFunction } from 'express';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const LOG_DIR = path.join(DATA_DIR, 'logs');
if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: jsonFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 5,
      tailable: true,
    }),
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'app.log'),
      maxsize: 20 * 1024 * 1024, // 20 MB
      maxFiles: 10,
      tailable: true,
    }),
  ],
});

// Console output in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        const extra = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
        return `${timestamp} ${level}: ${message}${extra}`;
      }),
    ),
  }));
}

// HTTP access log middleware — skip health check pings
export function httpLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    if (req.path === '/api/health') return;
    logger.info('http', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ms: Date.now() - start,
      ip: req.ip,
    });
  });
  next();
}
