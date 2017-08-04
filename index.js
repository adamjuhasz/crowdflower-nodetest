const express = require('express');
const bodyparser = require('body-parser');
const { fork } = require('child_process');
const path = require('path');
const request = require('request-promise');

const app = express();
app.use(bodyparser.json());

app.post('/convert', function(req, res, next) {
  if (!req.body.input) {
    return res.status(400).send({error: 'bad input'});
  }
  if (!req.body.output) {
    return res.status(400).send({error: 'bad output'});
  }

  // remove everything from strings expect for filename
  const inputPath = path.parse(req.body.input).base;
  const outputPath = path.parse(req.body.output).base;

  // as stated in email, fork and run a converter in a seperate process
  // add 'w' as 3rd argument to allow overwriting of files
  const forkResult = fork(path.join(__dirname, 'csv2json.js'), [ inputPath, outputPath], {
    silent: true,
  });
  let stderr = '';
  forkResult.stderr.on('data', (data) => {
    stderr = stderr + data.toString() + '\n';
  })
  forkResult.on('close', (code) => {
    if (code === 0) {
      res.send({ success: true });
    } else {
      res.status(400).send({ error: stderr.trim() });
    }
  });
})

app.post('/jobs/:jobId/tasks', function(req, res, next) {
  if (!req.body.name) {
    return res.status(400).send({error: 'missing name'});
  }
  if (!req.body.tags || !Array.isArray(req.body.tags)) {
    return res.status(400).send({error: 'missing tags'});
  }

  request({
    uri: 'https://cfassignment.herokuapp.com/tasks',
    method: 'POST',
    json: true,
  })
  .then((response) => request({
    uri: `https://cfassignment.herokuapp.com/tasks/${response.taskId}/tags`,
    method: 'POST',
    json: true,
    body: req.body.tags,
  }))
  .then((response) => request({
    uri: `https://cfassignment.herokuapp.com/jobs/${req.params.jobId}/tasks`,
    method: 'POST',
    json: true,
    body: {
      taskId: parseInt(response.taskId), // returns a string not a number
    },
  }))
  .then((response) => {
    response.success = true;
    response.tags = req.body.tags;
    res.send(response);
  })
  .catch((err) => {
    res.status(500).send(err.error);
  })

  
})

const server = app.listen(process.env.PORT || 3000, function () {
  var port = server.address().port;
  if (require.main === module) {
    console.log(`listening on port ${port}`);
  }
});

module.exports = server;