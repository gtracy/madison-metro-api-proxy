'use strict';

const moment = require('moment-timezone');
const got = require('got');

const utils = require('./utils');
const logger = require('pino')({level:'debug'});

const TRANSIT_API_ENDPOINT = "https://metromap.cityofmadison.com/bustime/api/v3/getpredictions?format=json";

module.exports = async function(app) {

    // API response object mimics the old-school SMB API, and
    // then tucks in the raw payload from Metro's API for 
    // each route coming through the stop
    // 
    // "route" : [{
    //     "routeID" : "4",
    //     "vehicleID" : "993",
    //     "human" : "Route 4 toward STP arrives in 10 minutes",
    //     "minutes" : "10",
    //     "arrivalTime" : "12:44pm",
    //     "destination" : "STP",
    //     "raw_metro" : {}
    // },
    // {
    //     "routeID" : "3",
    //     "vehicleID" : "433",
    //     "human" : "Route 3 toward ETP arrives in 12 minutes",
    //     "minutes" : "12",
    //     "arrivalTime" : "12:46pm",
    //     "destination" : "ETP",
    //     "raw_metro" : {}
    // },
    //
    app.get('/v1/getarrivals', utils.validateRequest, utils.afterHours, utils.validateDevKey, async (req,res) => {
        logger.debug('new getarrivals request!');
        let json_result = {};

        // snag the API query details
        const stopid = req.query.stopID;
        const devkey = req.query.key;

        // inspect results and build the payload
        json_result.status = "0";
        json_result.timestamp = moment().tz("America/Chicago").format("h:mmA");
        json_result.stop = {'stopID':stopid,'route':[]};
        json_result.cached = false;

        // route the request to the Metro API
        try {
            const metro_api_endpoint = TRANSIT_API_ENDPOINT + "&key=" + devkey + "&stpid=" + stopid;
            const response = await got(metro_api_endpoint,{
                responseType:'json',
                timeout: {request: 7000} // Timeout in milliseconds
            });
            const result = response.body;

            if( !result['bustime-response'] || result['bustime-response'].error ) {
                logger.error({result},`API is returning an error for ${stopid}`);
                throw new Error(`Metro API failed ${error}`);
            } else {
                const routes = [];
                result['bustime-response'].prd.forEach(prediction => {
                    routes.push({
                        routeID : prediction.rtdd,
                        vehicleID : prediction.vid,
                        human : `Route ${prediction.rtdd} toward ${prediction.des} arrives in ${prediction.prdctdn} minutes`,
                        minutes : prediction.prdctdn,
                        arrivalTime : extractTime(prediction.prdtm),
                        destination : prediction.des,
                        raw_metro : prediction
                    })
                });
                json_result.stop.route = routes;
                logger.debug(json_result,'/v1/getarrivals ');
                res.json(json_result);
                return;
            }
        } catch(e) {
            logger.error({e}, 'fail');
            json_result.status = "-1";
            json_result.message = "Metro API unable to process this request";
            logger.debug(json_result,'/v1/getarrivals ');
            res.json(json_result);
            return;
        }

    });

}

function extractTime(timeString) {
    try {
      const parts = timeString.split(' ');
      if (parts.length === 2) {
        return convertMilitaryToStandard(parts[1]);
      } else {
        logger.error(`failed to parse metro timestamp: ${timeString}`);
        return 'unknown';
      }
    } catch (error) {
        logger.error(`failed to parse metro timestamp: ${timeString}`);
        return 'unknown';
    }
  }

function convertMilitaryToStandard(militaryTime) {
    const parts = militaryTime.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    let period = 'AM';
  
    if (hours >= 12) {
      period = 'PM';
      if (hours > 12) {
        hours -= 12;
      }
    } else if (hours === 0) {
      hours = 12; // Midnight
    }
  
    return `${hours}:${minutes} ${period}`;
}
  