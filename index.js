'use strict';

const Motion = require('motion').Stream,
      Camera = require('./lib/camera'),
      AdafruitIO = require('adafruit-io'),
      base64 = require('base64-stream');

const aio = new AdafruitIO(
  process.env.AIO_USERNAME,
  process.env.AIO_KEY,
  { success: ready, failure: error }
);

function ready() {

  const camera = new Camera(),
        motion = new Motion();

  camera.pipe(motion)
        .pipe(base64.encode())
        .pipe(aio.feeds.writable(process.env.AIO_FEED || 'picam'));

}

function error(err) {
  console.error(err);
}

