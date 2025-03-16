const fs = require('fs');
const csv = require('csv-parser');
const got = require('got');

const API_KEY = 'FIXME';
const API_ENDPOINT = `https://metromap.cityofmadison.com/bustime/api/v3/getpredictions?format=json&key=${API_KEY}`;

async function makeApiCall(stop_identifier) {
    const endpoint = `${API_ENDPOINT}&stpid=${stop_identifier}`;

    try {
        console.log('Fetch with stop identifier: '+stop_identifier);
        const response = await got(endpoint, { responseType: 'json' });
        const result = response.body;
        if( result['bustime-response'].error ) {
            //console.log({result},`ERROR: API is returning an error for ${stop_identifier}`);
            return result['bustime-response'].error[0];
        } else {
            let route = {};
            if( result['bustime-response'].prd.length > 0 ) {
                const prediction = result['bustime-response'].prd[0];
                route = {
                    stop_name : prediction.stpnm,
                    stpid : prediction.stpid,
                    dstp : prediction.dstp,
                    route_direction : prediction.rtdir,
                    destination : prediction.des,
                };
            };
            return route;
        }
    } catch (error) {
        console.error('API call failed:', error);
        return {};
    }
}

async function processCsv(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    let row_count = 0;
    let rows = [];
    const stream = fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        rows.push(row);
      })
      .on('end', async () => {
            for (const row of rows) {
                if( row_count++ > 2000 ) break;
                if( !compareStopCodeAndDescription(row) ) {
                    console.log('ERROR: stop code mismatch');
                    break;
                }
                const stopCodeResult = await makeApiCall(row.stop_code);

                // Placeholder for comparing results
                // console.log('Stop ID Result:', stopIdResult);
                // console.log('Stop Code Result:', stopCodeResult);
                // Add your comparison logic here
                if( stopCodeResult.stpid !== row.stop_code ) {
                  console.log(`ERROR: stop code mismatch. Lookup ${row.stop_codd}. Found ${stopCodeResult.stpid}`);
                } else if( stopCodeResult.msg === "No data found for parameter" ) {
                  console.log(`ERROR: no data found ${row.stop_code}`);
                }

                await pauseRandomly();
            }
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

function compareStopCodeAndDescription(stop) {
    const { stop_code, stop_desc } = stop;
  
    if (!stop_desc) {
      console.log("stop_desc is missing.");
      return false;
    }
  
    const match = stop_desc.match(/#([a-zA-Z0-9]+)/);
  
    if (match) {
      const extractedNumber = match[1];
  
      if (extractedNumber === stop_code) {
        return true;
        //console.log(`stop_code and extracted number match for ${stop_name}.`);
      } else {
        return false;
        //console.log(`stop_code and extracted number DO NOT match for ${stop_name}.`);
      }
    } else {
      //console.log(`No number found after '#' in stop_desc for ${stop_code}\n${stop_desc}`);
      return true;
    }
}
  
function pauseRandomly() {
    const minSeconds = 1;
    const maxSeconds = 4;
  
    const randomSeconds = Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
    const milliseconds = randomSeconds * 1000;
  
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, milliseconds);
    });
}
  
async function main() {
  try {
    const results = await processCsv('test/stops.txt');
    console.log('CSV processing complete.');
    console.log(JSON.stringify(results, null, 2));
    // Process results here
  } catch (error) {
    console.error('Error:', error);
  }
}

main();