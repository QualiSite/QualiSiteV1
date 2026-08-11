import pino from 'pino';
import { config } from '../config.js';

const pinoLogger = pino({
  level: config.isProd ? 'info' : 'debug',
  ...(config.isProd ? {} : { transport: { target: 'pino-pretty' } }),
});

// Regroupe les arguments variadiques (message d'erreur, objet Error...)
// dans un objet unique : pino sérialise automatiquement une clé "err"
// contenant une Error (stack, message, type inclus dans le JSON produit).
function toLogObject(args: unknown[]) {
  const err = args.find((arg) => arg instanceof Error);
  const details = args.filter((arg) => arg !== err);

  const obj: Record<string, unknown> = {};
  if (err) obj.err = err;
  if (details.length > 0) obj.details = details;
  return obj;
}

const logger = {
  error: (msg: string, ...args: unknown[]) => pinoLogger.error(toLogObject(args), msg),
  warn: (msg: string, ...args: unknown[]) => pinoLogger.warn(toLogObject(args), msg),
  info: (msg: string, ...args: unknown[]) => pinoLogger.info(toLogObject(args), msg),
};

export default logger;
