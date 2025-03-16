## Metro system testing
When I lose confidence in the Metro system and stop details, I always turn to scripts like this one to better understand what is going on with stops and the API results. 

```
    > node test/test-gtfs.js
```

## Notes
* this code does _not_ test the proxy repo
* update the API_KEY with your own Madison Metro API key
* the stops.txt file is a snapshot in time for the Metro system. it comes directly from Metro's [published GTFS feed](http://transitdata.cityofmadison.com/GTFS/). if you want to run an _accurate_ test, you will want to refresh this file.