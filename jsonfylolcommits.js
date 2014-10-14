#!/usr/bin/env node

var fs             = require('fs'),
    path           = require('path'),
    colors         = require('colors'),
    commander      = require('commander'),
    prompt         = require('prompt'),
    homedir        = (process.platform === 'win32') ? process.env.HOMEPATH : process.env.HOME,
    lolcommitsdir  = homedir + '/.lolcommits',
    jsonData       = [];

var finished = 0, total = 0;

commander
  .version('1.1.1')
  .option('-q, --quiet', 'run without feedback')

commander.on('--help', function(){
  console.log('  Examples:');
  console.log('');
  console.log('    $ jsonfylolcommits out.json');
  console.log('    $ jsonfylolcommits out.json -q');
  console.log('');
});

commander.parse(process.argv);

var outputFilePath = commander.args[0];
if(typeof(outputFilePath) == 'undefined') {
    prompt.message = '';
    prompt.delimiter = '';
    var schema = {
        properties: {
            output: {
                description: "Path to the output file: ",
                default: homedir + "/.lolcommits/jsoncommits.json",
            }
        }
    }
    prompt.start();
    prompt.get(schema, function (err, result) {
        outputFilePath = result.output;
        loopThroughFiles(lolcommitsdir);
    });
} else {
    loopThroughFiles(lolcommitsdir);
}



// recursive walk through file tree
function loopThroughFiles(dir) {
    var files = fs.readdirSync(dir);
    if(dir !== lolcommitsdir) {
        if(!commander.quite) {
            console.log('\n' + path.basename(dir).yellow);
        }
    } else {
        for(var i = 0; i < files.length; i++) {
            if(fs.lstatSync(dir + '/' + files[i]).isDirectory()) {
                total++;
            }
        }
    }
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
    var file = fs.readFileSync(filePath),
        json = {};
    json[path.basename(filePath).replace('.jpg', '')] = file.toString('base64');
    if(!commander.quite) {
        console.log(' |_ ' + path.basename(filePath).green + ' converted to base64'.green);
    }
    jsonData.push(json);
}

function writeFile() {
    fs.writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 4));
    finished++;
    if(finished === total) {
        var newLine = commander.quite ? '' : '\n';
        console.log(newLine + 'Output file saved to ' + outputFilePath + '\n');
    }
}