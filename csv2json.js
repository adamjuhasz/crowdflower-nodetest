const csv = require('csvtojson');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// exit codes
// 0 - success
// 1 - bad arguments
// 2 - bad input file (probably doesn't exist)
// 3 - bad output file

let writeFlags = 'wx'; // fail if file already exists

if (process.argv.length < 4) {
  console.error('Incorrect argument format');
  process.exit(1);
}

if (process.argv.length >= 5) {
  writeFlags = process.argv[4];
}

const inputPath = path.join(__dirname, 'data', process.argv[2]);
const outputPath = path.join(__dirname, 'data', process.argv[3]);
const inputStream = fs.createReadStream(inputPath);
inputStream.on('error', (error) => {
  console.error('input error: ' + error.message);
  process.exit(2);
})
const outputStream = fs.createWriteStream(outputPath, {
  flags: writeFlags, 
});

csv({
  toArrayString: true,
})
  .fromStream(inputStream)
  .on('error', error => {
    console.error('input error: ' + error.message);
    process.exit(2);
  })
  .pipe(outputStream)
  .on('error', error => {
    console.error('output error: ' + error.message);
    process.exit(3);
  })
