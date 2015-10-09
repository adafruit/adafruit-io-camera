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

  const camera = new Camera(),
        motion = new Motion(),
        feed = aio.Feeds.writable('picam');

  camera.pipe(motion);

  motion.on('data', function(img) {
    feed.write(img.toString('base64'));
  });

}

function error(err) {
  console.error(err);
}

