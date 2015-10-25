# whosonfirst-www-iamhere

WORK IN PROGRESS

## Usage

### Running locally

Because some browsers are super conservative about what can and can't run on `localhost` (aka your local machine) and what can be served from a `file://` URL (aka your hard drive) the [tangram.js]() maps need to be "served" from an actual web server. A tiny little Python server is included in the `bin` directrory that is configured to serve static files from the `www` directory (in this repository). Like this:

```
102 ->./bin/iamhere-server
INFO:root:Serving up a whosonfirst-www-iamhere map on 127.0.0.1, port 8001
```

And then when you visit `http://127.0.0.1:8001` you would see the actual "iamhere" map in your web browser and the following on the command-line (where you started the `iamhere-server`):

```
127.0.0.1 - - [24/Oct/2015 22:04:39] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:39] "GET /css/bootstrap.min.css HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:40] "GET /css/leaflet.css HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:40] "GET /css/leaflet.label.css HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:40] "GET /css/mapzen.whosonfirst.iamhere.css HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:40] "GET /javascript/leaflet.js HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:40] "GET /javascript/leaflet.label.js HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:40] "GET /javascript/leaflet.hash.js HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:40] "GET /javascript/tangram.min.js HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:40] "GET /javascript/mapzen.whosonfirst.leaflet.js HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:40] "GET /javascript/mapzen.whosonfirst.leaflet.styles.js HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:40] "GET /javascript/mapzen.whosonfirst.leaflet.handlers.js HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:40] "GET /javascript/mapzen.whosonfirst.leaflet.tangram.js HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:40] "GET /javascript/mapzen.whosonfirst.geojson.js HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:40] "GET /javascript/mapzen.whosonfirst.php.js HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:40] "GET /javascript/mapzen.whosonfirst.data.js HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:40] "GET /javascript/mapzen.whosonfirst.net.js HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:40] "GET /javascript/mapzen.whosonfirst.log.js HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:40] "GET /javascript/mapzen.whosonfirst.enmapify.js HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:40] "GET /javascript/mapzen.whosonfirst.iamhere.js HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:40] "GET /tangram/refill.yaml?1445749480566 HTTP/1.1" 200 -
127.0.0.1 - - [24/Oct/2015 22:04:40] "GET /tangram/images/poi_icons_18@2x.png HTTP/1.1" 200 -
```

### Running remotely

TBW

## See also

* https://github.com/whosonfirst/whosonfirst-data
* https://github.com/whosonfirst/go-whosonfirst-pip
