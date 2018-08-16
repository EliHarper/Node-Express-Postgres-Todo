const express = require('express');
const router = express.Router();
const pg = require('pg');
const path = require('path');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/todo';

// Ours has only express, router and request fields
// followed by " const missionRoute = require(./mission) " for each route in routes folder

  /* 
    const logger = require('../logger) => pointing to logger.js file containing  const { Logger, transports } = require('winston'), { Console, File } = transports
            * This file contains transportType, options & transportReader (const fxns), logger instantiation with transports: transportReader
        
            At bottom:
            * module.exports.info = (message) => logger.log('info', message)
            * module.exports.warn = (message) => logger.log('warn', message)
            * module.exports.error = (message) => logger.log('error', message)
            * module.exports.debug = (message) => logger.log('debug', message)
    
    router.use('/healthcheck', healthcheck) => healthcheck.route.js with 
  */

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile('index.html');
});


// Insert Statements
router.post('/api/v1/todos', (req, res, next) => {
  const results = [];
  // Grab data from http request
  const data = {text: req.body.text, complete: false};
  // Get Postgres client from the connection pool (read more about this)
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Insert Data
    // Read or do codeacademy about Postgres syntax
    client.query('INSERT INTO items(text, complete) values($1, $2)',
    [data.text, data.complete]);
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM items ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // The data has been returned; postgres closes connection
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});


// Read/Get requests
router.get('/api/v1/todos', (req, res, next) => {
  const results = [];
  // Now get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM items ORDER BY id ASC;');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close the connection 
    // (put the lid on the milk) and return the results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});


// Update/Put requests
router.put('/api/v1/todos/:todo_id', (req, res, next) => {
  const results = [];
  // Grab data from the URL parameters (todo_id)
  const id = req.params.todo_id;
  // Grab data from the http request
  const data = {text: req.body.text, complete: req.body.complete};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Update Data
    client.query('UPDATE items SET text=($1), complete=($2) WHERE id=($3)',
      [data.text, data.complete, id]);
    // SQL Query > Select Data
    const query = client.query("Select * from items order by id ASC");
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // Put the cap on the milk
    query.on('end', function() {
      done();
      return res.json(results);
    });
  });
});


// Destroy/Delete requests
router.delete('/api/v1/todos/:todo_id', (req, res, next) => {
  const results = [];
  // Get the @PathVariable
  const id = req.params.todo_id;
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Delete Data
    client.query('delete from items where id=($1)', [id]);
    // SQL Query > Select Data
    var query = client.query('select * from items  order by id asc');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

module.exports = router;
