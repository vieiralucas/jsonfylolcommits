#!/usr/bin/env node

var fs             = require('fs'),
    path           = require('path'),
    homedir        = (process.platform === 'win32') ? process.env.HOMEPATH : process.env.HOME,
    lolcommitsdir  = homedir + '/.lolcommits',
    jsonData       = {},
    outputFilePath = process.argv[2];


loopThroughFiles(lolcommitsdir);

// recursive walk through file tree
function loopThroughFiles(dir) {

    var files = fs.readdirSync(dir);
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var filePath = dir + '/' + file;
        if(fs.lstatSync(filePath).isDirectory()) {
            // if file is a directory
            loopThroughFiles(filePath);
        } else if(path.extname(filePath) === '.jpg') {
            // if file is a jpg
            base64(filePath);
        }
    }
    writeFile();
}

function base64(filePath) {
    var file = fs.readFileSync(filePath)
    jsonData[path.basename(filePath).replace('.jpg', '')] = file.toString('base64');
}

function writeFile() {
    fs.writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 4));
}