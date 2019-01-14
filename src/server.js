require('dotenv').config();
const express = require('express');
const db = require('./db.js');
const ApiRouter = require('./routes');

const server = express();

server.use('/', ApiRouter);

server.listen(3000);