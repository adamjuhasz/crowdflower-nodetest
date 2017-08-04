const { fork } = require('child_process');
const path = require('path');
const fs = require('fs');
const request = require('request-promise');
const should = require('chai').should();
const assert = require('chai').assert;

describe('csv -> json', function() {
  const csvfile = 'example.csv';
  const jsonfile = 'example.json';
  it('spec example conversion', function(done) {
    const forkResult = fork(path.join(__dirname, '..', 'csv2json.js'), [ csvfile, jsonfile, 'w'], {
      silent: true,
    });
    let stderr = '';
    forkResult.stderr.on('data', (data) => {
      stderr = stderr + data.toString() + '\n';
    })
    forkResult.on('close', (code) => {
      if (code === 0) {
        // check to make sure contents are actually the same too
        const outputJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', jsonfile), 'utf8'));
        const specJSON = JSON.parse(fs.readFileSync(path.join(__dirname, 'example.json'), 'utf8'));
        outputJSON.should.eql(specJSON);
        done();
      } else {
        done(new Error(stderr));
      }
    });
  });

  it('should not overwrite file', function(done){
    const forkResult = fork(path.join('./', 'csv2json.js'), [ 'example2.csv', jsonfile], {
      silent: true,
    });
    let stderr = '';
    forkResult.stderr.on('data', (data) => {
      stderr = stderr + data.toString() + '\n';
    })
    forkResult.on('close', (code) => {
      if (code === 3) {
        // check to make sure contents haven't changes to example2, it has an extea line
        const outputJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', jsonfile), 'utf8'));
        const specJSON = JSON.parse(fs.readFileSync(path.join(__dirname, 'example.json'), 'utf8'));
        outputJSON.should.eql(specJSON);
        done();
      } else {
        done(new Error('Overwrote file'));
      }
    });
  });
})
