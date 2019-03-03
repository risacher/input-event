/**
 * Read Linux Inputs in node.js
 * Author: Daniel Risacher (dan@risacher.org)
 *
 * Adapted from keyboard.js by...
 * Author: William Petit (william.petit@lookingfora.name)
 *
 * Adapted from Tim Caswell's nice solution to read a linux joystick
 * http://nodebits.org/linux-joystick
 * https://github.com/nodebits/linux-joystick
 */

var fs = require('fs'),
//    ref = require('ref'),
    EventEmitter = require('events').EventEmitter;

var EV_SYN = 0,
    EV_KEY = 1,
    EV_REL = 2,
    EV_ABS = 3,
    EVENT_TYPES = ['keyup','keypress','keydown'];
   

function Mouse(dev) {
//    this.wrap('onOpen');
    var self = this;
    this.wrap('onRead');
    this.wrap('tryOpen');
    this.dev = dev;
    this.bufferSize = 24;
    this.buf = new Buffer(this.bufferSize);
    fs.open('/dev/input/' + this.dev, 'r', function (err, fd) { self.onOpen(err, fd) }); 
}

Mouse.prototype = Object.create(EventEmitter.prototype, {
  constructor: {value: Mouse}
});

Mouse.prototype.wrap = function(name) {
  var self = this;
  var fn = this[name];
  this[name] = function (err) {
    if (err) return self.emit('error', err);
    return fn.apply(self, Array.prototype.slice.call(arguments, 1));
  };
};

Mouse.prototype.onOpen = function(err, fd) {
    var self = this;
    if (err) {
//	console.log("my goodness: "+err);
	setTimeout(function (s) { fs.open('/dev/input/' + s.dev, 'r', 
					  function (err, fd) { s.onOpen(err, fd) } ) },
		   5000, self );
    } else {
	this.fd = fd;
	this.startRead();
	this.emit('opened', this.dev);
    }
};

Mouse.prototype.startRead = function() {
  fs.read(this.fd, this.buf, 0, this.bufferSize, null, this.onRead);
};

Mouse.prototype.onRead = function(bytesRead) {
  var event = parse(this, this.buf);
  if( event ) {
    event.dev = this.dev;
    this.emit(event.type, event);
  }
  if (this.fd) this.startRead();
};

Mouse.prototype.close = function(callback) {
  fs.close(this.fd, (function(){console.log(this);}));
  this.fd = undefined;
};


/**
 * Parse Input data
 */

function parse(input, buffer) {
    
    var event, value;
    var evtype = buffer.readUInt16LE(8)
//    console.log(buffer.toString('hex'), " ", buffer.length);
    if (process.arch === 'x64') {
	event = {
	    timeS: buffer.readUInt64LE(0),
	    timeMS: buffer.readUInt64LE(8),
	    type: buffer.readUInt16LE(16),
	    code: buffer.readUInt16LE(18),
	    value: buffer.readInt32LE(20)
	}; 
    } else { // arm or ia32
	event = {
	    timeS: buffer.readUInt32LE(0),
	    timeMS: buffer.readUInt32LE(4),
	    type: buffer.readUInt16LE(8),
	    code: buffer.readUInt16LE(10),
	    value: buffer.readInt32LE(12)
	};
    }
//    console.log(event);

    if( evtype === EV_KEY ) {
	
	
	event.keyId = BtnsIdx[event.code];
	event.type = EVENT_TYPES[ event.value ];
	
    } else if ( evtype === EV_REL ) {
	
	event.type = 'rel';
	event.axis = AxesIdx[event.code];

    } else if ( evtype === EV_ABS ) {

	event.axis = AxesIdx[event.value];
	event.type = 'abs';

    } else if (evtype === EV_SYN ) {
	event.type = 'syn';
    } else {
	return false;
    };
        
    return event;
};

// Btns
var Btns = {};

Btns["KEY_ESC"] = 1;
Btns["KEY_1"] = 2;
Btns["KEY_2"] = 3;
Btns["KEY_3"] = 4;
Btns["KEY_4"] = 5;
Btns["KEY_5"] = 6;
Btns["KEY_6"] = 7;
Btns["KEY_7"] = 8;
Btns["KEY_8"] = 9;
Btns["KEY_9"] = 10;
Btns["KEY_0"] = 11;
Btns["KEY_MINUS"] = 12;
Btns["KEY_EQUAL"] = 13;
Btns["KEY_BACKSPACE"] = 14;
Btns["KEY_TAB"] = 15;
Btns["KEY_Q"] = 16;
Btns["KEY_W"] = 17;
Btns["KEY_E"] = 18;
Btns["KEY_R"] = 19;
Btns["KEY_T"] = 20;
Btns["KEY_Y"] = 21;
Btns["KEY_U"] = 22;
Btns["KEY_I"] = 23;
Btns["KEY_O"] = 24;
Btns["KEY_P"] = 25;
Btns["KEY_LEFTBRACE"] = 26;
Btns["KEY_RIGHTBRACE"] = 27;
Btns["KEY_ENTER"] = 28;
Btns["KEY_LEFTCTRL"] = 29;
Btns["KEY_A"] = 30;
Btns["KEY_S"] = 31;
Btns["KEY_D"] = 32;
Btns["KEY_F"] = 33;
Btns["KEY_G"] = 34;
Btns["KEY_H"] = 35;
Btns["KEY_J"] = 36;
Btns["KEY_K"] = 37;
Btns["KEY_L"] = 38;
Btns["KEY_SEMICOLON"] = 39;
Btns["KEY_APOSTROPHE"] = 40;
Btns["KEY_GRAVE"] = 41;
Btns["KEY_LEFTSHIFT"] = 42;
Btns["KEY_BACKSLASH"] = 43;
Btns["KEY_Z"] = 44;
Btns["KEY_X"] = 45;
Btns["KEY_C"] = 46;
Btns["KEY_V"] = 47;
Btns["KEY_B"] = 48;
Btns["KEY_N"] = 49;
Btns["KEY_M"] = 50;
Btns["KEY_COMMA"] = 51;
Btns["KEY_DOT"] = 52;
Btns["KEY_SLASH"] = 53;
Btns["KEY_RIGHTSHIFT"] = 54;
Btns["KEY_KPASTERISK"] = 55;
Btns["KEY_LEFTALT"] = 56;
Btns["KEY_SPACE"] = 57;
Btns["KEY_CAPSLOCK"] = 58;
Btns["KEY_F1"] = 59;
Btns["KEY_F2"] = 60;
Btns["KEY_F3"] = 61;
Btns["KEY_F4"] = 62;
Btns["KEY_F5"] = 63;
Btns["KEY_F6"] = 64;
Btns["KEY_F7"] = 65;
Btns["KEY_F8"] = 66;
Btns["KEY_F9"] = 67;
Btns["KEY_F10"] = 68;
Btns["KEY_NUMLOCK"] = 69;
Btns["KEY_SCROLLLOCK"] = 70;
Btns["KEY_KP7"] = 71;
Btns["KEY_KP8"] = 72;
Btns["KEY_KP9"] = 73;
Btns["KEY_KPMINUS"] = 74;
Btns["KEY_KP4"] = 75;
Btns["KEY_KP5"] = 76;
Btns["KEY_KP6"] = 77;
Btns["KEY_KPPLUS"] = 78;
Btns["KEY_KP1"] = 79;
Btns["KEY_KP2"] = 80;
Btns["KEY_KP3"] = 81;
Btns["KEY_KP0"] = 82;
Btns["KEY_KPDOT"] = 83;
Btns["KEY_ZENKAKUHANKAKU"] = 85;
Btns["KEY_102ND"] = 86;
Btns["KEY_F11"] = 87;
Btns["KEY_F12"] = 88;
Btns["KEY_RO"] = 89;
Btns["KEY_KATAKANA"] = 90;
Btns["KEY_HIRAGANA"] = 91;
Btns["KEY_HENKAN"] = 92;
Btns["KEY_KATAKANAHIRAGANA"] = 93;
Btns["KEY_MUHENKAN"] = 94;
Btns["KEY_KPJPCOMMA"] = 95;
Btns["KEY_KPENTER"] = 96;
Btns["KEY_RIGHTCTRL"] = 97;
Btns["KEY_KPSLASH"] = 98;
Btns["KEY_SYSRQ"] = 99;
Btns["KEY_RIGHTALT"] = 100;
Btns["KEY_HOME"] = 102;
Btns["KEY_UP"] = 103;
Btns["KEY_PAGEUP"] = 104;
Btns["KEY_LEFT"] = 105;
Btns["KEY_RIGHT"] = 106;
Btns["KEY_END"] = 107;
Btns["KEY_DOWN"] = 108;
Btns["KEY_PAGEDOWN"] = 109;
Btns["KEY_INSERT"] = 110;
Btns["KEY_DELETE"] = 111;
Btns["KEY_MUTE"] = 113;
Btns["KEY_VOLUMEDOWN"] = 114;
Btns["KEY_VOLUMEUP"] = 115;
Btns["KEY_POWER"] = 116;
Btns["KEY_KPEQUAL"] = 117;
Btns["KEY_PAUSE"] = 119;
Btns["KEY_KPCOMMA"] = 121;
Btns["KEY_HANGUEL"] = 122;
Btns["KEY_HANJA"] = 123;
Btns["KEY_YEN"] = 124;
Btns["KEY_LEFTMETA"] = 125;
Btns["KEY_RIGHTMETA"] = 126;
Btns["KEY_COMPOSE"] = 127;
Btns["KEY_STOP"] = 128;
Btns["KEY_AGAIN"] = 129;
Btns["KEY_PROPS"] = 130;
Btns["KEY_UNDO"] = 131;
Btns["KEY_FRONT"] = 132;
Btns["KEY_COPY"] = 133;
Btns["KEY_OPEN"] = 134;
Btns["KEY_PASTE"] = 135;
Btns["KEY_FIND"] = 136;
Btns["KEY_CUT"] = 137;
Btns["KEY_HELP"] = 138;
Btns["KEY_F13"] = 183;
Btns["KEY_F14"] = 184;
Btns["KEY_F15"] = 185;
Btns["KEY_F16"] = 186;
Btns["KEY_F17"] = 187;
Btns["KEY_F18"] = 188;
Btns["KEY_F19"] = 189;
Btns["KEY_F20"] = 190;
Btns["KEY_F21"] = 191;
Btns["KEY_F22"] = 192;
Btns["KEY_F23"] = 193;
Btns["KEY_F24"] = 194;
Btns["KEY_UNKNOWN"] = 240;

//Btns['BTN_MISC'] =                0x100;
Btns['BTN_0'] =                   0x100;
Btns['BTN_1'] =                   0x101;
Btns['BTN_2'] =                   0x102;
Btns['BTN_3'] =                   0x103;
Btns['BTN_4'] =                   0x104;
Btns['BTN_5'] =                   0x105;
Btns['BTN_6'] =                   0x106;
Btns['BTN_7'] =                   0x107;
Btns['BTN_8'] =                   0x108;
Btns['BTN_9'] =                   0x109;

Btns['BTN_MOUSE'] =               0x110;
Btns['BTN_LEFT'] =                0x110;
Btns['BTN_RIGHT'] =               0x111;
Btns['BTN_MIDDLE'] =              0x112;
Btns['BTN_SIDE'] =                0x113;
Btns['BTN_EXTRA'] =               0x114;
Btns['BTN_FORWARD'] =             0x115;
Btns['BTN_BACK'] =                0x116;
Btns['BTN_TASK'] =                0x117;

Btns['BTN_JOYSTICK'] =            0x120;
Btns['BTN_TRIGGER'] =             0x120;
Btns['BTN_THUMB'] =               0x121;
Btns['BTN_THUMB2'] =              0x122;
Btns['BTN_TOP'] =                 0x123;
Btns['BTN_TOP2'] =                0x124;
Btns['BTN_PINKIE'] =              0x125;
Btns['BTN_BASE'] =                0x126;
Btns['BTN_BASE2'] =               0x127;
Btns['BTN_BASE3'] =               0x128;
Btns['BTN_BASE4'] =               0x129;
Btns['BTN_BASE5'] =               0x12a;
Btns['BTN_BASE6'] =               0x12b;
Btns['BTN_DEAD'] =                0x12f;

Btns['BTN_GAMEPAD'] =             0x130;
Btns['BTN_A'] =                   0x130;
Btns['BTN_B'] =                   0x131;
Btns['BTN_C'] =                   0x132;
Btns['BTN_X'] =                   0x133;
Btns['BTN_Y'] =                   0x134;
Btns['BTN_Z'] =                   0x135;
Btns['BTN_TL'] =                  0x136;
Btns['BTN_TR'] =                  0x137;
Btns['BTN_TL2'] =                 0x138;
Btns['BTN_TR2'] =                 0x139;
Btns['BTN_SELECT'] =              0x13a;
Btns['BTN_START'] =               0x13b;
Btns['BTN_MODE'] =                0x13c;
Btns['BTN_THUMBL'] =              0x13d;
Btns['BTN_THUMBR'] =              0x13e;

Btns['BTN_DIGI'] =                0x140;
Btns['BTN_TOOL_PEN'] =            0x140;
Btns['BTN_TOOL_RUBBER'] =         0x141;
Btns['BTN_TOOL_BRUSH'] =          0x142;
Btns['BTN_TOOL_PENCIL'] =         0x143;
Btns['BTN_TOOL_AIRBRUSH'] =       0x144;
Btns['BTN_TOOL_FINGER'] =         0x145;
Btns['BTN_TOOL_MOUSE'] =          0x146;
Btns['BTN_TOOL_LENS'] =           0x147;
Btns['BTN_TOOL_QUINTTAP'] =       0x148;   /* Five fingers on trackpad */
Btns['BTN_TOUCH'] =               0x14a;
Btns['BTN_STYLUS'] =              0x14b;
Btns['BTN_STYLUS2'] =             0x14c;
Btns['BTN_TOOL_DOUBLETAP'] =      0x14d;
Btns['BTN_TOOL_TRIPLETAP'] =      0x14e;
Btns['BTN_TOOL_QUADTAP'] =        0x14f;   /* Four fingers on trackpad */

Btns['BTN_WHEEL'] =               0x150;
Btns['BTN_GEAR_DOWN'] =           0x150;
Btns['BTN_GEAR_UP'] =             0x151;

var Keys = Btns;

Keys["KEY_ESC"] = 1;
Keys["KEY_1"] = 2;
Keys["KEY_2"] = 3;
Keys["KEY_3"] = 4;
Keys["KEY_4"] = 5;
Keys["KEY_5"] = 6;
Keys["KEY_6"] = 7;
Keys["KEY_7"] = 8;
Keys["KEY_8"] = 9;
Keys["KEY_9"] = 10;
Keys["KEY_0"] = 11;
Keys["KEY_MINUS"] = 12;
Keys["KEY_EQUAL"] = 13;
Keys["KEY_BACKSPACE"] = 14;
Keys["KEY_TAB"] = 15;
Keys["KEY_Q"] = 16;
Keys["KEY_W"] = 17;
Keys["KEY_E"] = 18;
Keys["KEY_R"] = 19;
Keys["KEY_T"] = 20;
Keys["KEY_Y"] = 21;
Keys["KEY_U"] = 22;
Keys["KEY_I"] = 23;
Keys["KEY_O"] = 24;
Keys["KEY_P"] = 25;
Keys["KEY_LEFTBRACE"] = 26;
Keys["KEY_RIGHTBRACE"] = 27;
Keys["KEY_ENTER"] = 28;
Keys["KEY_LEFTCTRL"] = 29;
Keys["KEY_A"] = 30;
Keys["KEY_S"] = 31;
Keys["KEY_D"] = 32;
Keys["KEY_F"] = 33;
Keys["KEY_G"] = 34;
Keys["KEY_H"] = 35;
Keys["KEY_J"] = 36;
Keys["KEY_K"] = 37;
Keys["KEY_L"] = 38;
Keys["KEY_SEMICOLON"] = 39;
Keys["KEY_APOSTROPHE"] = 40;
Keys["KEY_GRAVE"] = 41;
Keys["KEY_LEFTSHIFT"] = 42;
Keys["KEY_BACKSLASH"] = 43;
Keys["KEY_Z"] = 44;
Keys["KEY_X"] = 45;
Keys["KEY_C"] = 46;
Keys["KEY_V"] = 47;
Keys["KEY_B"] = 48;
Keys["KEY_N"] = 49;
Keys["KEY_M"] = 50;
Keys["KEY_COMMA"] = 51;
Keys["KEY_DOT"] = 52;
Keys["KEY_SLASH"] = 53;
Keys["KEY_RIGHTSHIFT"] = 54;
Keys["KEY_KPASTERISK"] = 55;
Keys["KEY_LEFTALT"] = 56;
Keys["KEY_SPACE"] = 57;
Keys["KEY_CAPSLOCK"] = 58;
Keys["KEY_F1"] = 59;
Keys["KEY_F2"] = 60;
Keys["KEY_F3"] = 61;
Keys["KEY_F4"] = 62;
Keys["KEY_F5"] = 63;
Keys["KEY_F6"] = 64;
Keys["KEY_F7"] = 65;
Keys["KEY_F8"] = 66;
Keys["KEY_F9"] = 67;
Keys["KEY_F10"] = 68;
Keys["KEY_NUMLOCK"] = 69;
Keys["KEY_SCROLLLOCK"] = 70;
Keys["KEY_KP7"] = 71;
Keys["KEY_KP8"] = 72;
Keys["KEY_KP9"] = 73;
Keys["KEY_KPMINUS"] = 74;
Keys["KEY_KP4"] = 75;
Keys["KEY_KP5"] = 76;
Keys["KEY_KP6"] = 77;
Keys["KEY_KPPLUS"] = 78;
Keys["KEY_KP1"] = 79;
Keys["KEY_KP2"] = 80;
Keys["KEY_KP3"] = 81;
Keys["KEY_KP0"] = 82;
Keys["KEY_KPDOT"] = 83;
Keys["KEY_ZENKAKUHANKAKU"] = 85;
Keys["KEY_102ND"] = 86;
Keys["KEY_F11"] = 87;
Keys["KEY_F12"] = 88;
Keys["KEY_RO"] = 89;
Keys["KEY_KATAKANA"] = 90;
Keys["KEY_HIRAGANA"] = 91;
Keys["KEY_HENKAN"] = 92;
Keys["KEY_KATAKANAHIRAGANA"] = 93;
Keys["KEY_MUHENKAN"] = 94;
Keys["KEY_KPJPCOMMA"] = 95;
Keys["KEY_KPENTER"] = 96;
Keys["KEY_RIGHTCTRL"] = 97;
Keys["KEY_KPSLASH"] = 98;
Keys["KEY_SYSRQ"] = 99;
Keys["KEY_RIGHTALT"] = 100;
Keys["KEY_HOME"] = 102;
Keys["KEY_UP"] = 103;
Keys["KEY_PAGEUP"] = 104;
Keys["KEY_LEFT"] = 105;
Keys["KEY_RIGHT"] = 106;
Keys["KEY_END"] = 107;
Keys["KEY_DOWN"] = 108;
Keys["KEY_PAGEDOWN"] = 109;
Keys["KEY_INSERT"] = 110;
Keys["KEY_DELETE"] = 111;
Keys["KEY_MUTE"] = 113;
Keys["KEY_VOLUMEDOWN"] = 114;
Keys["KEY_VOLUMEUP"] = 115;
Keys["KEY_POWER"] = 116;
Keys["KEY_KPEQUAL"] = 117;
Keys["KEY_PAUSE"] = 119;
Keys["KEY_KPCOMMA"] = 121;
Keys["KEY_HANGUEL"] = 122;
Keys["KEY_HANJA"] = 123;
Keys["KEY_YEN"] = 124;
Keys["KEY_LEFTMETA"] = 125;
Keys["KEY_RIGHTMETA"] = 126;
Keys["KEY_COMPOSE"] = 127;
Keys["KEY_STOP"] = 128;
Keys["KEY_AGAIN"] = 129;
Keys["KEY_PROPS"] = 130;
Keys["KEY_UNDO"] = 131;
Keys["KEY_FRONT"] = 132;
Keys["KEY_COPY"] = 133;
Keys["KEY_OPEN"] = 134;
Keys["KEY_PASTE"] = 135;
Keys["KEY_FIND"] = 136;
Keys["KEY_CUT"] = 137;
Keys["KEY_HELP"] = 138;
Keys["KEY_F13"] = 183;
Keys["KEY_F14"] = 184;
Keys["KEY_F15"] = 185;
Keys["KEY_F16"] = 186;
Keys["KEY_F17"] = 187;
Keys["KEY_F18"] = 188;
Keys["KEY_F19"] = 189;
Keys["KEY_F20"] = 190;
Keys["KEY_F21"] = 191;
Keys["KEY_F22"] = 192;
Keys["KEY_F23"] = 193;
Keys["KEY_F24"] = 194;
Keys["KEY_UNKNOWN"] = 240;


var BtnsIdx = {};
for( key in Btns ) {
    if ( Btns.hasOwnProperty(key) ) {
	BtnsIdx[Btns[key]] = key;
    }
}

Mouse.Btns = Btns;
Mouse.BtnsIdx = BtnsIdx;

Axes = {};

Axes['REL_X'] =                   0x00;
Axes['REL_Y'] =                   0x01;
Axes['REL_Z'] =                   0x02;
Axes['REL_RX'] =                  0x03;
Axes['REL_RY'] =                  0x04;
Axes['REL_RZ'] =                  0x05;
Axes['REL_HWHEEL'] =              0x06;
Axes['REL_DIAL'] =                0x07;
Axes['REL_WHEEL'] =               0x08;
Axes['REL_MISC'] =                0x09;

AxesIdx = {};
for( key in Axes ) {
    if ( Axes.hasOwnProperty(key) ) {
	AxesIdx[Axes[key]] = key;
    }
}


Mouse.Axes = Axes;
Mouse.AxesIdx = AxesIdx;

module.exports = exports = Mouse;


/*
var k = new Mouse('event0');
k.on('keyup', console.log);
k.on('keydown', console.log);
k.on('keypress', console.log);
k.on('rel', console.log);
k.on('abs', console.log);
*/