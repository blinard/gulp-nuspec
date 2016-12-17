'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var extend = require('object-assign');

var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-nuspec';

function gulpNuspec(nuspecConfig) {
    validateNuspecConfig(nuspecConfig);
    nuspecConfig = populateNuspecConfigDefaults(nuspecConfig, extend);

    // Creating a stream through which each file will pass
    return through.obj(function(file, encoding, callback) {
        if (!file.path || file.isDirectory()) {
            // don't do anything with these types of files
            return callback(null, file);
        }

        var blah = file.path;
        var blah2 = file.relative;

        callback(null, file);
    });
}

module.exports = gulpNuspec;

function validateNuspecConfig(nuspecConfig) {
    if(!nuspecConfig) {
        throw new PluginError(PLUGIN_NAME, 'Missing nuspec config!');
    }

    if(!nuspecConfig.id) {
        throw new PluginError(PLUGIN_NAME, 'Missing nuspec id!');
    }
}

function populateNuspecConfigDefaults(nuspecConfig, extend) {
    var nuspecConfigWithDefaults = extend(nuspecConfig, nuspecConfigWithDefaults);

    if(!nuspecConfigWithDefaults.version) {
        nuspecConfigWithDefaults.version = "1.0.0.0";
    }

    if(!nuspecConfigWithDefaults.title) {
        nuspecConfigWithDefaults.title = nuspecConfigWithDefaults.id;
    }

    if(nuspecConfigWithDefaults.requireLicenseAcceptance === undefined) {
        nuspecConfigWithDefaults.requireLicenseAcceptance = false;
    }

    return nuspecConfigWithDefaults;
}
