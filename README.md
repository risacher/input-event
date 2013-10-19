input-event
===========

nodejs module for reading keyboard &amp; mouse events from /dev/input/eventX  (the linux event interface)

based on github.com/Bornholm/node-keyboard, which in turn was based on
http://nodebits.org/linux-joystick.  This was tested on a Raspberry Pi
with a 32-bit kernel.  There is code to detect 64-bit kernel but it is
untested.

See also: https://www.kernel.org/doc/Documentation/input/input.txt

Usage
-----

See demo.js

    var input-event = require('input-event');

    var k = new input-event('event0'); // 'event0' is the file corresponding to my keyboard in /dev/input/
    k.on('keyup', console.log);
    k.on('keydown', console.log);
    k.on('keypress', console.log);
    k.on('rel', console.log);
    k.on('abs', console.log);
    k.on('syn', console.log);

Events

        { 
          timeS: 1382214166,  // Timestamp ( Seconds part )
          timeMS: 193255,  // Timestamp ( Microseconds part )
          type: 'rel',  // relative movement
          code: 8,
          value: -1,  // backward
          axis: 'REL_WHEEL',  // Mouse wheel
          dev: 'event0' 
        }

        { 
          timeS: 1382214485,
          timeMS: 798176,
          type: 'keyup',
          code: 272,
          value: 0,
          keyId: 'BTN_LEFT',
          dev: 'event0' 
        }

Dependencies
------------

not so much