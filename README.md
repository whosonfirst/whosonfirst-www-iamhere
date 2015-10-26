# whosonfirst-www-iamhere

WORK IN PROGRESS

## Usage

### Running locally

Because some browsers are super conservative about what can and can't run on `localhost` (aka your local machine) and what can be served from a `file://` URL (aka your hard drive) the [tangram.js]() maps need to be "served" from an actual web server. A tiny little web server (written in Python) is included in the `bin` directrory that is configured to serve static files from the `www` directory (in this repository). Like this:

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

#### Caveats

You should treat this web server as a toy. Anecdotally it is also very finnicky. It is included in order to try and minimize the number of _other things_ you need to install on your computer in order to get the examples working. Not everyone has Python installed on their computers by default but many do. Personally I prefer [go-whosonfirst-fileserver](https://github.com/whosonfirst/go-whosonfirst-fileserver) but unless you're confortable with yet-another language (Go) and build process you probably don't want to go there.

### Running remotely

TBW

### Running a local copy of `go-whosonfirst-pip`

For example:

```
./bin/pip-server -cors -data /usr/local/mapzen/whosonfirst-data/data /usr/local/mapzen/whosonfirst-data/meta/wof-neighbourhood-latest.csv /usr/local/mapzen/whosonfirst-data/meta/wof-marinearea-latest.csv 
```

## See also

* https://github.com/whosonfirst/whosonfirst-data
* https://github.com/whosonfirst/go-whosonfirst-pip
