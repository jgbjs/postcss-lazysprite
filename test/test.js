/* eslint-disable handle-callback-err */
/* eslint-disable no-unused-vars */
var should = require('should');
var fs = require('fs');
var path = require('path');
var vfs = require('vinyl-fs');
var through2 = require('through2');
var postcss = require('gulp-postcss');
var uploadImage = require('free-upload-image');
var noop = function () {};
var lazysprite = require('../index.js');

/**
 * Test Points
 *
 * - Create sprites correctly, including correct css content and images files.
 * - Retina support are work well. @2x and _2x are all work well.
 * - Wrong option will alert you.(not yet)
 * - `nameSpace`  option should work.
 * - `smartUpdate` option should work.
 * - `outputDimensions` option should work.
 * - `logLevel` option should work.(not yet)
 * - In @lazysprite atrule value, single quotes (') and double quotes (") are both support.(not need)
 */

describe('postcss-lazysprite Unit Test', function () {
  describe('Basic Functions', function () {
    // Delete dist dir before testing evertime.

    before(function (done) {
      fs.mkdir('./test/dist', function (err) {
        done();
      });
    });

    afterEach(function (done) {
      fs.rmdir('./test/dist', function (err) {
        done();
      });
    });

    it('Create normal sprites -> should create correct css content and images files.', function (done) {
      vfs.src('./test/src/css/test.1.css')
        .pipe(postcss([lazysprite({
          imagePath: './test/src/slice',
          stylesheetInput: './test/src/css',
          stylesheetRelative: './test/dist/css',
          spritePath: './test/dist/sprites',
          logLevel: 'slient' // 'debug','info','slient'
        })]))
        .pipe(through2.obj(function (file, enc, cb) {
          var content = file.contents.toString();
          // Fs.writeFileSync('./test/src/css/test.1.excepted.css', content, 'utf8');
          var cssExpected = fs.readFileSync(path.resolve(process.cwd(), './test/src/css/test.1.excepted.css'), {
            encoding: 'utf8'
          });
          var spritesExists1 = fs.existsSync(path.resolve(process.cwd(), './test/dist/sprites/filetype.png'));
          var spritesExists2 = fs.existsSync(path.resolve(process.cwd(), './test/dist/sprites/filetype@2x.png'));

          cssExpected.should.be.equal(content);
          spritesExists1.should.be.ok();
          spritesExists2.should.be.ok();
          cb();
        }))
        .on('data', noop)
        .on('end', done);
    });

    it('Create svg sprites (even if mix with png files) -> should create correct css content & files.', function (done) {
      vfs.src('./test/src/css/test.8.css')
        .pipe(postcss([lazysprite({
          imagePath: './test/src/slice',
          stylesheetInput: './test/src/css',
          stylesheetRelative: './test/dist/css',
          spritePath: './test/dist/sprites',
          logLevel: 'slient' // 'debug','info','slient'
        })]))
        .pipe(through2.obj(function (file, enc, cb) {
          var content = file.contents.toString();
          // Fs.writeFileSync('./test/src/css/test.8.excepted.css', content, 'utf8');
          var cssExpected = fs.readFileSync(path.resolve(process.cwd(), './test/src/css/test.8.excepted.css'), {
            encoding: 'utf8'
          });
          var spritesExists1 = fs.existsSync(path.resolve(process.cwd(), './test/dist/sprites/docs.svg'));
          var spritesExists2 = fs.existsSync(path.resolve(process.cwd(), './test/dist/sprites/docs.png'));
          var spritesExists3 = fs.existsSync(path.resolve(process.cwd(), './test/dist/sprites/docs@2x.png'));

          cssExpected.should.be.equal(content);
          spritesExists1.should.be.ok();
          spritesExists2.should.be.ok();
          spritesExists3.should.be.ok();
          cb();
        }))
        .on('data', noop)
        .on('end', done);
    });

    it('Retina support -> should @2x and _2x are all work well.', function (done) {
      vfs.src('./test/src/css/test.2.css')
        .pipe(postcss([lazysprite({
          imagePath: './test/src/slice',
          stylesheetInput: './test/src/css',
          stylesheetRelative: './test/dist/css',
          spritePath: './test/dist/sprites',
          logLevel: 'slient' // 'debug','info','slient'
        })]))
        .pipe(through2.obj(function (file, enc, cb) {
          var content = file.contents.toString();
          // Fs.writeFileSync('./test/src/css/test.2.excepted.css', content, 'utf8');
          var cssExpected = fs.readFileSync(path.resolve(process.cwd(), './test/src/css/test.2.excepted.css'), {
            encoding: 'utf8'
          });
          var spritesExists1 = fs.existsSync(path.resolve(process.cwd(), './test/dist/sprites/logo@2x.png'));
          var spritesExists2 = fs.existsSync(path.resolve(process.cwd(), './test/dist/sprites/logo@3x.png'));

          // Fs.writeFileSync('./test/src/css/test.2.excepted.css', content, 'utf8');
          cssExpected.should.be.equal(content);
          spritesExists1.should.be.ok();
          spritesExists2.should.be.ok();
          cb();
        }))
        .on('data', noop)
        .on('end', done);
    });

    it('Multi `@lazysprite` atRule -> should work with multi `@lazysprite` atRule.', function (done) {
      var cssExpected = fs.readFileSync(path.resolve(process.cwd(), './test/src/css/test.4.excepted.css'), {
        encoding: 'utf8'
      });

      vfs.src('./test/src/css/test.4.css')
        .pipe(postcss([lazysprite({
          imagePath: './test/src/slice',
          stylesheetInput: './test/src/css',
          stylesheetRelative: './test/dist/css',
          spritePath: './test/dist/sprites',
          logLevel: 'slient' // 'debug','info','slient'
        })]))
        .pipe(through2.obj(function (file, enc, cb) {
          var content = file.contents.toString();
          // Fs.writeFileSync('./test/src/css/test.4.excepted.css', content, 'utf8');
          cssExpected.should.be.equal(content);
          cb();
        }))
        .on('data', noop)
        .on('end', done);
    });

    it('Dynamic selector block name -> should work well with dynamic selector block name.', function (done) {
      vfs.src('./test/src/css/test.5.css')
        .pipe(postcss([lazysprite({
          imagePath: './test/src/slice',
          stylesheetInput: './test/src/css',
          stylesheetRelative: './test/dist/css',
          spritePath: './test/dist/sprites',
          logLevel: 'slient' // 'debug','info','slient'
        })]))
        .pipe(through2.obj(function (file, enc, cb) {
          var content = file.contents.toString();
          content.match(/newBlockName/g).length.should.equal(4);
          cb();
        }))
        .on('data', noop)
        .on('end', done);
    });

    it('`:hover` and `:active` support -> should work with `Hover` in single image name.', function (done) {
      vfs.src('./test/src/css/test.6.css')
        .pipe(postcss([lazysprite({
          imagePath: './test/src/slice',
          stylesheetInput: './test/src/css',
          stylesheetRelative: './test/dist/css',
          spritePath: './test/dist/sprites',
          pseudoClass: true,
          logLevel: 'slient' // 'debug','info','slient'
        })]))
        .pipe(through2.obj(function (file, enc, cb) {
          var content = file.contents.toString();
          content.match(/:hover/g).length.should.equal(2);
          cb();
        }))
        .on('data', noop)
        .on('end', done);
    });

    it('Second depth directory css files -> should work well.', function (done) {
      vfs.src('./test/src/css/second/test.8.css')
        .pipe(postcss([lazysprite({
          imagePath: './test/src/slice',
          stylesheetInput: './test/src/css',
          stylesheetRelative: './test/dist/css',
          spritePath: './test/dist/sprites',
          pseudoClass: true,
          logLevel: 'slient' // 'debug','info','slient'
        })]))
        .pipe(through2.obj(function (file, enc, cb) {
          var content = file.contents.toString();
          content.match(/\.\.\/\.\.\/s/g).length.should.equal(4);
          cb();
        }))
        .on('data', noop)
        .on('end', done);
    });
  });

  describe('Options Functions', function () {
    before(function (done) {
      fs.mkdir('./test/dist', function (err) {
        done();
      });
    });

    afterEach(function (done) {
      fs.rmdir('./test/dist', function (err) {
        done();
      });
    });

    after(function (done) {
      fs.rmdir('./test/dist', function (err) {
        done();
      });
    });

    it('`upload` opiton-> should work well.', function (done) {
      vfs.src('./test/src/css/test.9.css')
        .pipe(postcss([lazysprite({
          imagePath: './test/src/slice',
          stylesheetInput: './test/src/css',
          stylesheetRelative: './test/dist/css',
          spritePath: './test/dist/sprites',
          upload: function (filePath) {
            return uploadImage(filePath)
              .then(url => url, () => filePath);
          },
          logLevel: 'info' // 'debug','info','slient'
        })]))
        .pipe(through2.obj(function (file, enc, cb) {
          var content = file.contents.toString();

          content.match(/url\(https:/g).length.should.equal(2);
          cb();
        }))
        .on('data', noop)
        .on('end', done);
    });

    it('`nameSpace`  option -> should work well.', function (done) {
      vfs.src('./test/src/css/test.1.css')
        .pipe(postcss([lazysprite({
          imagePath: './test/src/slice',
          stylesheetInput: './test/src/css',
          stylesheetRelative: './test/dist/css',
          spritePath: './test/dist/sprites',
          nameSpace: 'ww_',
          logLevel: 'slient'
        })]))
        .pipe(through2.obj(function (file, enc, cb) {
          var content = file.contents.toString();
          content.match(/ww_/g).length.should.equal(4);
          cb();
        }))
        .on('data', noop)
        .on('end', done);
    });

    it('`outputDimensions`  option -> should work well.', function (done) {
      vfs.src('./test/src/css/test.3.css')
        .pipe(postcss([lazysprite({
          imagePath: './test/src/slice',
          stylesheetInput: './test/src/css',
          stylesheetRelative: './test/dist/css',
          spritePath: './test/dist/sprites',
          outputDimensions: false,
          logLevel: 'slient' // 'debug','info','slient'
        })]))
        .pipe(through2.obj(function (file, enc, cb) {
          var content = file.contents.toString();
          content.match(/width/g).length.should.equal(1);
          content.match(/height/g).length.should.equal(1);
          cb();
        }))
        .on('data', noop)
        .on('end', done);
    });

    it('`retinaInfix` opiton-> should work well.', function (done) {
      vfs.src('./test/src/css/test.7.css')
        .pipe(postcss([lazysprite({
          imagePath: './test/src/slice',
          stylesheetInput: './test/src/css',
          stylesheetRelative: './test/dist/css',
          spritePath: './test/dist/sprites',
          retinaInfix: '_',
          logLevel: 'slient' // 'debug','info','slient'
        })]))
        .pipe(through2.obj(function (file, enc, cb) {
          // Var content = file.contents.toString();
          var spritesExists1 = fs.existsSync(path.resolve(process.cwd(), './test/dist/sprites/check.png'));
          var spritesExists2 = fs.existsSync(path.resolve(process.cwd(), './test/dist/sprites/check_2x.png'));
          spritesExists1.should.be.ok();
          spritesExists2.should.be.ok();
          cb();
        }))
        .on('data', noop)
        .on('end', done);
    });

    it('`outputExtralCSS` opiton-> should work well.', function (done) {
      vfs.src('./test/src/css/test.1.css')
        .pipe(postcss([lazysprite({
          imagePath: './test/src/slice',
          stylesheetInput: './test/src/css',
          stylesheetRelative: './test/dist/css',
          spritePath: './test/dist/sprites',
          outputExtralCSS: true,
          logLevel: 'slient' // 'debug','info','slient'
        })]))
        .pipe(through2.obj(function (file, enc, cb) {
          var content = file.contents.toString();
          content.match(/display: inline-block/g).length.should.equal(1);
          content.match(/overflow: hidden/g).length.should.equal(1);
          content.match(/font-size: 0/g).length.should.equal(1);
          content.match(/line-height: 0/g).length.should.equal(1);
          cb();
        }))
        .on('data', noop)
        .on('end', done);
    });

    it('`usePseudoBefore` opiton-> should work well.', function (done) {
      vfs.src('./test/src/css/test.9.css')
        .pipe(postcss([lazysprite({
          imagePath: './test/src/slice',
          stylesheetInput: './test/src/css',
          stylesheetRelative: './test/dist/css',
          spritePath: './test/dist/sprites',
          usePseudoBefore: true,
          logLevel: 'slient' // 'debug','info','slient'
        })]))
        .pipe(through2.obj(function (file, enc, cb) {
          var content = file.contents.toString();
          content.match(/position: absolute/g).length.should.equal(2);
          content.match(/position: relative/g).length.should.equal(2);
          content.match(/:before/g).length.should.equal(2);
          content.match(/content: ''/g).length.should.equal(2);
          content.match(/transform-origin: top left/g).length.should.equal(2);
          // Console.log(content);
          cb();
        }))
        .on('data', noop)
        .on('end', done);
    });
  });
});
