var requireFromGhost = function(module, blocking) {
    try {
        return require('ghost/' + module);
    } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') throw e;
        try {
            return require(path.join(process.cwd(), module));
        } catch (e) {
            if (e.code !== 'MODULE_NOT_FOUND' || blocking) throw e;
            return null;
        }
    }
};


var Promise = require('bluebird');
var cloudinary = require('cloudinary');
var util = require('util');
var baseStore = requireFromGhost("core/server/storage/base", false)


function CloudinaryStore(config) {
    baseStore.call(this);
    this.config = config || {};
    cloudinary.config(config);
}

util.inherits(CloudinaryStore, baseStore);

CloudinaryStore.prototype.save = function(image) {
  var secure = this.config.secure || false;

  return new Promise(function(resolve) {
    cloudinary.uploader.upload(image.path, function(result) {
      resolve(secure ? result.secure_url : result.url);
    });
  });
};

CloudinaryStore.prototype.delete = function(image) {

  return new Promise(function(resolve) {
    cloudinary.uploader.destroy('zombie', function(result) {
      resolve(result)
    });
  });
};

CloudinaryStore.prototype.exists = function(filename) {
  return new Promise(function(resolve) {
    if (cloudinary.image(filename, { })) {
        resolve(true);
    } else {
        resolve(false);
    }
  });

}

CloudinaryStore.prototype.serve = function() {
  return function (req, res, next) {
    next();
  };
};

module.exports = CloudinaryStore;