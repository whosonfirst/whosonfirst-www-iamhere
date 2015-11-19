# bin

This folder contains pre-compiled binary applications for use with `whosonfirst-www-youarehere`. Supported operating systems are:

* OS X
* Linux
* Windows

If your operating system is not listed here [let us know](https://github.com/whosonfirst/whosonfirst-www-iamhere/issues) and we can investigate adding it.

## wof-pip-server

```
Usage of ./bin/osx/wof-pip-server:
  -cache_size int
    	      The number of WOF records with large geometries to cache (default 1024)
  -cache_trigger int
    		 The minimum number of coordinates in a WOF record that will trigger caching (default 2000)
  -cors
	Enable CORS headers
  -data string
    	The data directory where WOF data lives, required
  -logs string
    	Where to write logs to disk
  -metrics string
    	   Where to write (@rcrowley go-metrics style) metrics to disk
  -metrics-as string
    	      Format metrics as... ? Valid options are "json" and "plain" (default "plain")
  -port int
    	The port number to listen for requests on (default 8080)
  -strict
	Enable strict placetype checking
  -verbose
	Enable verbose logging, or log level "info"
  -verboser
	Enable really verbose logging, or log level "debug"
```

For example:

```
$> ./bin/osx/wof-pip-server -port 8080 -cors -data /usr/local/mapzen/whosonfirst-data/data /usr/local/mapzen/whosonfirst-data/meta/wof-neighbourhood-latest.csv /usr/local/mapzen/whosonfirst-data/meta/wof-marinearea-latest.csv 
```

## wof-fileserver

```
Usage of ./bin/osx/wof-fileserver:
  -cors
	Enable CORS headers
  -path string
    	Path served as document root. (default "./")
  -port int
    	Port to listen (default 8080)
```

For example:

```
$> ./bin/osx/wof-fileserver -port 8001 -path /usr/local/mapzen/whosonfirst-www-iamhere/www/
```
