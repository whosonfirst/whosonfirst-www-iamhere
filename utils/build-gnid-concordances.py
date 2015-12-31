#!/usr/bin/env python

import os
import sys
import logging
import csv

import mapzen.whosonfirst.utils

if __name__ == "__main__":

    import optparse
    opt_parser = optparse.OptionParser()

    opt_parser.add_option('-w', '--wof', dest='wof', action='store', default=None, help='The path to your Who\'s On First repository')
    opt_parser.add_option('-v', '--verbose', dest='verbose', action='store_true', default=False, help='Be chatty (default is false)')

    options, args = opt_parser.parse_args()

    if options.verbose:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

    wof = os.path.abspath(options.wof)
    data = os.path.join(wof, 'data')
    meta = os.path.join(wof, 'meta')

    concordances = os.path.join(meta, "wof-concordances-latest.csv")

    fh = open(concordances, "r")
    reader = csv.DictReader(fh)
    writer = None

    for row in reader:

        if row.get("gn:id", "") == "":
            continue

        feature = mapzen.whosonfirst.utils.load(data, row['wof:id'])
        props = feature['properties']

        if not props['wof:placetype'] in ('locality', 'country'):
            continue

        if not writer:
            writer = csv.DictWriter(sys.stdout, fieldnames=('gn:id', 'wof:id'))
            writer.writeheader()

        out = {'gn:id': row['gn:id'], 'wof:id': row['wof:id']}
        writer.writerow(out)

    sys.exit(0)
    

