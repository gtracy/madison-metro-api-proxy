# madison-metro-api-proxy
Lightweight proxy for the Madison Metro API service

## API Support
The proxy only supports Metro's getpredictions call but with the goal of this service becoming a drop-in replacement for the old SMB API, the endpoint and payload matches that old implementation. Note that I'm also **_shoving the raw Metro API details into the payload under 'raw_metro'_**

https://xxxxxxx/v1/getarrivals?key=GET_KEY_FROM_METRO&stopID=METRO_STOP_CODE

```json
{
    "status": "0",
    "timestamp": "10:20AM",
    "stop": {
        "stopID": "1787",
        "route" : [{
            "routeID": "E",
            "vehicleID": "149",
            "human": "Route E toward MCKEE arrives in 4 minutes",
            "minutes": "4",
            "arrivalTime": "10:25 AM",
            "destination": "MCKEE",
            "raw_metro": {
                "tmstmp": "20250316 10:20",
                "typ": "D",
                "stpnm": "S Pinckney at E Main",
                "stpid": "1787",
                "vid": "149",
                "dstp": -38,
                "rt": "E",
                "rtdd": "E",
                "rtdir": "WESTBOUND",
                "des": "MCKEE",
                "prdtm": "20250316 10:25",
                "tablockid": "312E",
                "tatripid": "1217525",
                "origtatripno": "1217525",
                "dly": false,
                "dyn": 0,
                "prdctdn": "4",
                "zone": "",
                "psgld": "",
                "stst": 37500,
                "stsd": "2025-03-16",
                "flagstop": 0
            }
        }]
    }
}
```

### Get started
1. Sign-up for a Metro API developer account [here](https://metromap.cityofmadison.com/account).
2. Send me an email to get the proxy endpoint.

## Run Locally
You can run this repo locally with very little configuration.
### Setup local Node environment
```
    > npm install
```  
### Run server
```
    > API_KEY_REGEX="^[a-zA-Z0-9]{25}$" nodemon app-local.js | pino-pretty
```
API_KEY_REGEX attempts to provide broud support for Metro API keys without needing to track developer keys that are using the proxy. 