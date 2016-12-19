/* global describe, it, beforeEach */
'use strict';

var gulpNuspec = require('../');
var gulp = require('gulp');
var File = require('vinyl');
/*
var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');
var es = require('event-stream');
*/

const SPEC_BASE = 'spec/';

describe('gulp-nuspec', function () {
  var fakeFile;

  function getFakeFile(fileContent) {
    return new File({
      path: SPEC_BASE + 'fixture/file.txt',
      cwd: SPEC_BASE,
      base: SPEC_BASE + 'fixture/',
      contents: new Buffer(fileContent || '')
    });
  }

  function getFakeFileReadStream() {
    return new File({
      contents: es.readArray(['Hello world']),
      path: SPEC_BASE + 'fixture/anotherFile.txt'
    });
  }

  it("throws error on empty nuspecConfig", function() {
      var caughtErr = undefined;
      try {
        gulpNuspec();
      } catch(err) {
        caughtErr = err;
      }

      expect(caughtErr).toBeTruthy();
  });

  it("throws error on empty nuspecConfig id", function() {
      var caughtErr = undefined;
      try {
        gulpNuspec({});
      } catch(err) {
        caughtErr = err;
      }

      expect(caughtErr).toBeTruthy();
  });

  it("throws error on empty nuspecConfig author", function() {
      var caughtErr = undefined;
      try {
        gulpNuspec({ id: 'test.id'});
      } catch(err) {
        caughtErr = err;
      }

      expect(caughtErr).toBeTruthy();
  });

  beforeEach(function () {
    fakeFile = getFakeFile('Hello world');
  });

  it('file should pass through', function (done) {
    var file_count = 0;
    var fileDotTextFound = false;
    var stream = gulpNuspec({ id: 'gulp-nuspec', author: 'me' });
    stream.on('data', function (newFile) {
      ++file_count;
      if (!fileDotTextFound && 
          newFile && 
          newFile.path && 
          newFile.relative && 
          newFile.contents && 
          newFile.path === SPEC_BASE + 'fixture/file.txt' && 
          newFile.relative === 'file.txt' && 
          newFile.contents.toString('utf8') === 'Hello world') {
        fileDotTextFound = true;
      }
    });

    stream.once('end', function () {
      expect(file_count).toBe(2);
      done();
    });

    stream.write(fakeFile);
    stream.end();

    expect(fileDotTextFound).toBeTruthy();
  });

  it('multiple files should pass through', function (done) {
    var headerText = 'use strict;',
      stream = gulp.src(SPEC_BASE + 'fixture/*.txt').pipe(gulpNuspec({ id: 'gulp-nuspec', author: 'me' })),
      files = [];

    stream.on('error', done);
    stream.on('data', function (file) {
      files.push(file);
    });
    stream.on('end', function () {
      expect(files.length).toBe(3);
      done();
    });
  });

  it("outputs a .nuspec based on files input", function() {

  });

  it("skips directories", function() {

  });

  it("skips files with empty path", function() {

  });
});


/*describe('gulp-nuspec', function () {

  describe('header', function () {

    it('should prepend the header to the file content', function (done) {
      var myHeader = header('And then i said : ');

      myHeader.write(fakeFile);

      myHeader.once('data', function (file) {
        should(file.isBuffer()).ok;
        should.exist(file.contents);
        file.contents.toString('utf8').should.equal('And then i said : Hello world');
        done();
      });
      myHeader.end();
    });

    it('should prepend the header to the file content (stream)', function (done) {
      var myHeader = header('And then i said : ');

      myHeader.write(getFakeFileReadStream());

      myHeader.once('data', function (file) {
        should(file.isStream()).ok;
        file.contents.pipe(es.wait(function (err, data) {
          data.toString('utf8').should.equal('And then i said : Hello world');
          done();
        }));
      });
      myHeader.end();
    });

    it('should format the header', function (done) {
      var stream = header('And then <%= foo %> said : ', { foo: 'you' });
      //var stream = header('And then ${foo} said : ', { foo : 'you' } );
      stream.on('data', function (newFile) {
        should.exist(newFile.contents);
        newFile.contents.toString('utf8').should.equal('And then you said : Hello world');
      });
      stream.once('end', done);

      stream.write(fakeFile);
      stream.end();
    });

    it('should format the header (ES6 delimiters)', function (done) {
      var stream = header('And then ${foo} said : ', { foo: 'you' });
      stream.on('data', function (newFile) {
        should.exist(newFile.contents);
        newFile.contents.toString('utf8').should.equal('And then you said : Hello world');
      });
      stream.once('end', done);

      stream.write(fakeFile);
      stream.end();
    });

    it('should access to the current file', function (done) {
      var stream = header([
        '<%= file.relative %>',
        '<%= file.path %>',
        ''].join('\n'));
      stream.on('data', function (newFile) {
        should.exist(newFile.contents);
        newFile.contents.toString('utf8').should.equal('file.txt\n./test/fixture/file.txt\nHello world');
      });
      stream.once('end', done);

      stream.write(fakeFile);
      stream.end();
    });

    it('no files are acceptable', function (done) {
      var headerText = 'use strict;',
        stream = gulp.src('./test/fixture/*.html').pipe(header(headerText)),
        files = [];

      stream.on('error', done);
      stream.on('data', function (file) {
        files.push(file);
      });
      stream.on('end', function () {
        files.length.should.equal(0);
        done();
      });
    });
  });

});*/