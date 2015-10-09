'use strict';

const Motion = require('motion').Stream,
      Camera = require('./lib/camera'),
      AdafruitIO = require('adafruit-io');

const aio = new AdafruitIO(
  process.env.AIO_USERNAME,
  process.env.AIO_KEY,
  { success: ready, failure: error }
);

function ready() {
  const camera = new Camera();
  camera.pipe(aio.Feeds.writable('picam'));
}

function error(err) {
  console.error(err);
}

