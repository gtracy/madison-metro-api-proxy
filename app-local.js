'use strict'

const app = require('./app');
const logger = require('pino')();
const LISTENER_PORT = 3300;

app.listen(LISTENER_PORT, () => {
    logger.info(`Server starting on port ${LISTENER_PORT}.`);
});
