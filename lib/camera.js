'use strict';

const RaspiCam = require('raspicam'),
      Readable = require('stream').Readable,
      os = require('os'),
      path = require('path'),
      fs = require('fs');

class Camera extends Readable {

  constructor(options) {

    super();

    this.buffer = [];
    this.options = {
      mode: 'timelapse',
      timeout: 2,
      output: path.join(os.tmpdir(), 'aio_cam', '%d.jpg')
    };

    Object.assign(this.options || {});

    this.camera = new RaspiCam(this.options);
    this.camera.start();
    this.camera.on('read', this.processImage.bind(this));
    this.camera.on('error', this.emit.bind(this, 'error'));

  }

  processImage(err, file) {

    if(err)
      return this.emit('error', err);

    fs.readFile(file, (err, data) => {

      if(err)
        return this.emit('error', err);

      this.buffer.push(data);
      this.emit('image', file);

    });

  }

  _read() {

    if(! this.buffer.length)
      return this.once('image', this._read.bind(this));

    this.push(this.buffer.shift());

  }

}
