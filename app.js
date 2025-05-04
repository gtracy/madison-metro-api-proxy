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

// Middleware to extract path from event when/if calling from a naked
// Lambda endpoint without API Gateway
app.use((req, res, next) => {
    console.log('********** middleware ***********');
    if (req.apiGateway && req.apiGateway.event) {
        console.log('extracing path from the Lambda event');
        console.dir(req.apiGateway.event);
        req.url = req.apiGateway.event.rawPath + (req.apiGateway.event.rawQueryString ? '?' + req.apiGateway.event.rawQueryString : '');
        console.dir(req.url);
    }
    next();
});
  
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
