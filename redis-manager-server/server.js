'use strict'

//Import config options for develop
const config = require('./src/config/default.json');
const bodyParser = require("body-parser");
const express = require("express");
//Import msg module

const _apiPort = config.webServicePort;
global.app = express();
global.router = express.Router();
global.path = __dirname;

app.use(bodyParser.json()); // support json encoded bodies
app.use("/", router);

require('./src/router/router');


//Server runner
app.listen(_apiPort, function () {
    console.log(`server running on ${_apiPort}`);
});