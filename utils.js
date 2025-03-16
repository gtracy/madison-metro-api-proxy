'use strict';

const moment = require('moment-timezone');
const logger = require('pino')();

// ignore requests with missing query parameters
module.exports.validateRequest = (req,res,next) => {

    if( !req.query.key ) {
        logger.debug('missing dev key in request '+req.query.key);
        res.json({
            status: "-1",
            description: "missing developer key in request (?key=)"
        });
    } else if( !req.query.stopID ) {
        logger.debug('missing stopID in request '+req.query.key);
        res.json({
            status: "-1",
            description: "missing stopID in request (?stopID=)"
        });
    } else {
        logger.debug('request structure is valid');
        next();
    }

}

// ignore any request between midnight and 5am
module.exports.afterHours = (req,res,next) => {

    let now = moment().tz("America/Chicago");
    if( now.hour() >= 1 && now.hour() < 5 ) {
        logger.debug('ignore request. we are after hours');
        // return empty results
        res.json({
            status: "0",
            timestamp: moment().tz("America/Chicago").format("h:mmA"),
            stop: {'stopID' : req.query.stopID,'route':[]},
            cached: false
        });
    } else {
        next();
    }

}

module.exports.validateDevKey = function(req,res,next) {

    // the dev key regex test is passed in via an environment variable
    // to keep it out of the codebase. test it here
    if( !process.env.API_KEY_REGEX ) {
        logger.error('missing api key regex');
        next(new Error('unabled to validate dev key without a regex defiition'));
    }

    logger.debug('validate the dev key: '+req.query.key);
    const apiKeyRegexPattern = process.env.API_KEY_REGEX;
    const apiKeyRegex = new RegExp(apiKeyRegexPattern);

    const devkey = req.query.key;
    if( !devkey ) {
        // missing key
        logger.error('missing dev key');
        next(new Error('Missing dev key (?key=) in request'));
    } else if( !apiKeyRegex.test(devkey) ) {
        // invalid key format. this is a guess really that the format 
        // of all keys are the same. may need to revisit this design 
        // if the Metro API service is passing out differently formatted
        // keys to developers
        logger.error({devkey}, 'invalid dev key format');
        next(new Error('Invalid dev key'));
    } else {
        // treat this key as valid from the proxy's perspective
        // it may still fail when passed to the Metro API
        next();
    }

}