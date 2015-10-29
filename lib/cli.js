'use strict';

const CLI = require('adafruit-io').CLI,
      Yargs = require('yargs');

class CameraCLI extends CLI {

  constructor() {

    super('camera');

    this.completions = [
      'help',
      'config'
    ];

    this.yargs = Yargs(process.argv.slice(3));

  }

  init() {

    if(! process.env.AIO_CLIENT_USER || ! process.env.AIO_CLIENT_KEY)
      return this.requireAuth(this.yargs);

    this.completions = [
      'help',
      'config',
      'start',
      'restart',
      'stop'
    ];

    if(require('os').platform() === 'linux')
      this.completions.push('install', 'remove');

    this.yargs.usage('Usage: adafruit-io camera <command> [options]');

    if(require('os').platform() === 'linux') {
      this.yargs.command('install', 'Install camera service (linux only)');
      this.yargs.command('remove', 'Remove camera service (linux only)');
    }

    const argv = this.yargs
      .command('start', 'Start camera daemon')
      .command('restart', 'Restart camera daemon')
      .command('stop', 'Stop camera daemon')
      .command('help', 'Show help')
      .alias('m', 'motion').boolean('m').default('m', process.env.MOTION || false).describe('m', 'Motion Tracking')
      .alias('t', 'threshold').nargs('t', 1).default('t', process.env.MOTION_THRESH || '21').describe('t', 'Motion Threshold')
      .alias('c', 'change').nargs('c', 1).default('c', process.env.MOTION_MINCHANGE || '10').describe('c', 'Motion Minimum Change')
      .alias('s', 'seconds').nargs('s', 1).default('s', process.env.MOTION_MINSECONDS || '1').describe('s', 'Motion Minimum Seconds')
      .alias('f', 'framerate').nargs('f', 1).default('f', process.env.CAM_RATE || '2').describe('f', 'Timelapse Capture Rate (seconds)')
      .alias('h', 'hflip').boolean('h').default('h', process.env.CAM_HFLIP || false).describe('h', 'Camera Horizontal Flip')
      .alias('v', 'vflip').boolean('v').default('v', process.env.CAM_VFLIP || false).describe('v', 'Camera Vertical Flip')
      .demand(1, 'You must supply a valid camera command')
      .argv;

    if(! argv)
      return;

    const command = argv._[0];

    if(command === 'help')
      return this.yargs.showHelp();

    process.env.MOTION = argv.motion;
    process.env.MOTION_THRESH = argv.threshold;
    process.env.MOTION_MINCHANGE = argv.change;
    process.env.MOTION_MINSECONDS = argv.seconds;
    process.env.CAM_HFLIP = argv.hflip;
    process.env.CAM_VFLIP = argv.vflip;
    process.env.CAM_RATE = argv.framerate;

    this.saveEnv();

    if(! this[command])
      return this.yargs.showHelp();

    this[command]();

  }

  install() {

    if(require('os').platform() !== 'linux')
      return this.error('running adafruit io as a service is only supported on linux');

    this.logo();
    this.info('installing service...');

    this.foreverService('install');
    this.info(`The camera service is now installed and pushing images to Adafruit IO`);

  }

  remove() {

    if(require('os').platform() !== 'linux')
      return this.error('running the camera as a service is only supported on linux');

    this.foreverService('remove');
    this.info('removing service...');

  }

  start() {

    this.logo();
    this.info('starting camera...');

    this.forever('start');
    this.info(`Camera daemon started and is pushing images to Adafruit IO`);

  }

  restart() {
    this.forever('restart');
    this.info('restarting camera...');
  }

  stop() {
    this.forever('stop');
    this.info('stopping camera...');
  }

  requireAuth(yargs) {

    const argv = yargs
      .usage('Usage: adafruit-io camera config [options]')
      .alias('h', 'host').nargs('h', 1).default('h', process.env.AIO_CLIENT_HOST || 'io.adafruit.com').describe('h', 'Adafruit IO Server hostname')
      .alias('p', 'port').nargs('p', 1).default('p', process.env.AIO_CLIENT_MQTT_PORT || '8883').describe('p', 'Adafruit IO MQTT port')
      .alias('u', 'username').demand('username').nargs('u', 1).describe('u', 'Adafruit IO Username')
      .alias('k', 'key').demand('key').nargs('k', 1).describe('k', 'Adafruit IO Key')
      .command('help', 'Show help')
      .argv;

    process.env.AIO_CLIENT_HOST = argv.host;
    process.env.AIO_CLIENT_PORT = argv.port;
    process.env.AIO_CLIENT_USER = argv.username;
    process.env.AIO_CLIENT_KEY  = argv.key;

    this.saveEnv();

  }


}

exports = module.exports = CameraCLI;
