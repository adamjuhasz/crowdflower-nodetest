const request = require('request-promise');
const should = require('chai').should();
const assert = require('chai').assert;

describe('server', function() {
  let server;

  before(function(){
    server = require('../index');
  });

  after(function(){
    server.close();
  })

  describe('tasks', function() {
    const jobId = 12;
    it('add task', function() {
      return request({
        uri: `http://localhost:3000/jobs/${jobId}/tasks`,
        method: 'POST',
        json: true,
        body: {
          name: 'super job',
          tags: ['super', 'ai'],
        },
      });
    });

    it('has empty name', function() {
      return request({
        uri: `http://localhost:3000/jobs/${jobId}/tasks`,
        method: 'POST',
        json: true,
        body: {
          name: '',
          tags: ['hi'],
        },
      })
      .then(() => assert(false), () => assert(true)); // flip the promise
    });

    it('has a string for tags', function() {
      return request({
        uri: `http://localhost:3000/jobs/${jobId}/tasks`,
        method: 'POST',
        json: true,
        body: {
          name: 'another one',
          tags: '',
        },
      })
      .then(() => assert(false), () => assert(true)); // flip the promise
    });
  });

  describe('conversion', function(){
    it('convert successfully', function() {
      return request({
        uri: 'http://localhost:3000/convert',
        method: 'POST',
        json: true,
        body: {
          input: 'example.csv',
          output: 'test.json'
        },
      });
    });

    it('has bad input', function() {
      return request({
        uri: 'http://localhost:3000/convert',
        method: 'POST',
        json: true,
        body: {
          input: '.csv',
          output: '12345.json'
        },
      })
      .then(() => assert(false), () => assert(true)); // flip the promise
    });

    it('has bad output', function() {
      return request({
        uri: 'http://localhost:3000/convert',
        method: 'POST',
        json: true,
        body: {
          input: 'example.csv',
          output: ''
        },
      })
      .then(() => assert(false), () => assert(true)); // flip the promise
    });
  })
});
