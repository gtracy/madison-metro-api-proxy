'use strict';

const express = require('express');
const cors = require('cors');
const pino = require('pino-http')();

// request logger
let logger = (req,res,next) => {
    req.log.info('new request');
    next();
}

const app = express();
app.use(pino);
app.use(cors({
    origin: '*',
    methods: 'GET',
    allowedHeaders: 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    preflightContinue: true
}));
app.use(logger);

// API endpoint registration
require('./schedule')(app);

// API backstop
app.get('*', (req,res) => {
    res.json({
        "status": -1,
        "description": 'unsupported endpoint'
    });
});

// error handler
app.use( (err, req, res, next) => {
    res.json({
        "status": -1,
        "description": err
    });
});

module.exports = app;
