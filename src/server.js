require('dotenv').config();
const express = require('express');
const db = require('./db.js');
const ApiRouter = require('./routes');

const server = express();

server.use('/', ApiRouter);

server.listen(process.env.SERVER_PORT);

process.on('exit', () => {
  db.close();
});