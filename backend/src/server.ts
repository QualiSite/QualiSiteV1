import app from './app.js';
import { config } from './config.js';
import logger from './lib/logger.js';

app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
});