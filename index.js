'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var extend = require('object-assign');
var path = require('path');

var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-nuspec';

function gulpNuspec(nuspecConfig) {
    validateNuspecConfig(nuspecConfig);
    nuspecConfig = populateNuspecConfigDefaults(nuspecConfig, extend);
    var lastFile;
    var nuspecContents;

    // Creating a stream through which each file will pass
    return through.obj(processFile, endStream);

    function processFile(file, encoding, callback) {
        if (!file.path || file.isDirectory()) {
            // don't do anything with these types of files
            return callback(null, file);
        }

        if (!nuspecContents) {
            nuspecContents = getNuspecBeginning(nuspecConfig, gutil);
        }

        var replacedPath = getReplacedPath(file.relative, nuspecConfig);
        nuspecContents += getNuspecFileEntry(file.relative, replacedPath);

        lastFile = file;
        callback(null, file);
    }

    function endStream(callback) {
        if (!nuspecContents || !lastFile) {
            callback();
            return;
        }

        nuspecContents += getNuspecEnd();

        var nuspecFile = lastFile.clone({contents: false});
        nuspecFile.path = path.join(lastFile.base, nuspecConfig.filename);
        nuspecFile.contents = new Buffer(nuspecContents);

        this.push(nuspecFile);
        callback();
    }

    function getNuspecBeginning(nuspecConfig, gutil) {
        var nuspecBeginningTemplate = 
        `
        <?xml version="1.0" encoding="utf-8"?>
        <package xmlns="http://schemas.microsoft.com/packaging/2010/07/nuspec.xsd">
            <metadata>
                <id><%= id %></id>
                <version><%= version %></version>
                <description><%= description %></description>
                <authors><%= author %></authors>
            </metadata>
            <files>
            
        `
        return gutil.template(nuspecBeginningTemplate, {
            id: nuspecConfig.id,
            version: nuspecConfig.version,
            description: nuspecConfig.description,
            author: nuspecConfig.author,
            file: null
        });
    }

    function getReplacedPath(filePath, nuspecConfig) {
        for(var i = 0; i < nuspecConfig.replacementPaths.length; i++) {
            var replacementPath = nuspecConfig.replacementPaths[i];
            if (filePath.indexOf(replacementPath.findPath) < 0) {
                continue;
            }

            return filePath.replace(replacementPath.findPath, replacementPath.newPath);
        }

        return filePath;
    }

    function getNuspecEnd() {
        var nuspecEnd = 
        `
            </files>
        </package>
        `
        return nuspecEnd;
    }

    function getNuspecFileEntry(srcPath, replacedPath) {
        return '<file src="' + srcPath + '" target="' + replacedPath + '" />';
    }

    function validateNuspecConfig(nuspecConfig) {
        if(!nuspecConfig) {
            throw new PluginError(PLUGIN_NAME, 'Missing nuspec config!');
        }

        if(!nuspecConfig.id) {
            throw new PluginError(PLUGIN_NAME, 'Missing nuspec id!');
        }

        if(!nuspecConfig.author) {
            throw new PluginError(PLUGIN_NAME, 'Missing nuspec author!');
        }
    }

    function populateNuspecConfigDefaults(nuspecConfig, extend) {
        var nuspecConfigWithDefaults = extend(nuspecConfig, nuspecConfigWithDefaults);

        if(!nuspecConfigWithDefaults.version) {
            nuspecConfigWithDefaults.version = '1.0.0.0';
        }

        if(!nuspecConfigWithDefaults.title) {
            nuspecConfigWithDefaults.title = nuspecConfigWithDefaults.id;
        }

        if(!nuspecConfigWithDefaults.filename) {
            nuspecConfigWithDefaults.filename = nuspecConfigWithDefaults.id + '@' + nuspecConfigWithDefaults.version + '.nuspec'
        }

        if(nuspecConfigWithDefaults.requireLicenseAcceptance === undefined) {
            nuspecConfigWithDefaults.requireLicenseAcceptance = false;
        }

        if(!nuspecConfigWithDefaults.replacementPaths) {
            nuspecConfigWithDefaults.replacementPaths = [];
        }

        if(!nuspecConfigWithDefaults.description) {
            nuspecConfigWithDefaults.description = 'Description';
        }

        return nuspecConfigWithDefaults;
    }    
}

module.exports = gulpNuspec;

