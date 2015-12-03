# bin

This folder contains pre-compiled binary applications for use with `whosonfirst-www-youarehere`. Supported operating systems are:

* OS X
* Linux
* Windows

If your operating system is not listed here [let us know](https://github.com/whosonfirst/whosonfirst-www-iamhere/issues) and we can investigate adding it.

## wof-pip-server

This is what you'll need to enable the point-in-polygon support in `whosonfirst-www-youarehere`. It is a command-line application that you will need to start from a terminal, passing in a number of arguments specific to your use case. For example:

```
$> ./bin/osx/wof-pip-server -port 8080 -cors -data /usr/local/mapzen/whosonfirst-data/data /usr/local/mapzen/whosonfirst-data/meta/wof-neighbourhood-latest.csv /usr/local/mapzen/whosonfirst-data/meta/wof-marinearea-latest.csv 
```

The complete list of options available when starting the point-in-polygon server is included below:

```
Usage of wof-pip-server:
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

## wof-fileserver

This is a very simple HTTP file server. It is included as a convenience for people who don't want to think about running their own web server. For example:

```
$> ./bin/osx/wof-fileserver -port 8001 -path /usr/local/mapzen/whosonfirst-www-iamhere/www/
```

The complete list of options available when starting the file server is included below:

```
Usage of wof-fileserver:
  -cors
	Enable CORS headers
  -path string
    	Path served as document root. (default "./")
  -port int
    	Port to listen (default 8080)
```

## wof-clone-metafiles

This is a tool for downloading and storing Who's On First documents defined in one or more ["meta" files](https://github.com/whosonfirst/whosonfirst-data/tree/master/meta).

```
Usage of ./bin/osx/wof-clone-metafiles:
  -dest string
    	Where to write files
  -loglevel string
    	    The level of detail for logging (default "info")
  -procs int
    	 The number of concurrent processes to clone data with (default 8)
  -skip-existing
	Skip existing files on disk (without checking for remote changes)
  -source string
    	  Where to look for files (default "https://whosonfirst.mapzen.com/data/")
```

## See also

* https://github.com/whosonfirst/go-whosonfirst-pip
* https://github.com/whosonfirst/go-whosonfirst-fileserver
* https://github.com/whosonfirst/go-whosonfirst-clone
