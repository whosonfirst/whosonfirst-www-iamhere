#!/usr/bin/env python
# -*-python-*-

import os
import sys
import logging
import subprocess
import signal
import time

# please rewrite me in go (so it can be cross-compiled)

if __name__ == '__main__':

    import optparse
    opt_parser = optparse.OptionParser()

    opt_parser.add_option('-d', '--data', dest='data', action='store', default=None, help='The path to your Who\'s On First data')
    opt_parser.add_option('-v', '--verbose', dest='verbose', action='store_true', default=False, help='Be chatty (default is false)')

    options, args = opt_parser.parse_args()

    if options.verbose:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

    whatami = sys.platform

    whoami = os.path.abspath(sys.argv[0])
    bin = os.path.dirname(whoami)
    root = os.path.dirname(bin)

    bin = os.path.join(root, "bin")
    www = os.path.join(root, "www")
    
    # please to check for linux and windows

    if whatami == 'darwin':
        bin = os.path.join(bin, "osx")
    else:
        logging.error("unsupported platform")
        sys.exit()

    pip_server = os.path.join(bin, "wof-pip-server")
    file_server = os.path.join(bin, "wof-fileserver")

    pip_cmd = [pip_server, "-cors", "-port", "8080", "-data", options.data]
    pip_cmd.extend(args)

    data_cmd = [file_server, "-cors", "-port", "9999", "-path", options.data]

    www_cmd = [file_server, "-port", "8001", "-path", www]

    logging.debug(" ".join(pip_cmd))
    logging.debug(" ".join(data_cmd))
    logging.debug(" ".join(www_cmd))

    # sys.exit()

    pip = subprocess.Popen(pip_cmd)
    data = subprocess.Popen(data_cmd)
    www = subprocess.Popen(www_cmd)

    def signal_handler(signal, frame):

        pip.terminate()
        data.terminate()
        www.terminate()

        raise Exception, "all done"

    signal.signal(signal.SIGINT, signal_handler)

    try:
        while True:
            time.sleep(.5)
    except Exception, e:
        pass

    logging.info("all done")
    sys.exit()
    
