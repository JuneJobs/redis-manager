'use strict';

//Import request manager module
const LlRequest = require("../lib/ISRequest");

const Redis = require("ioredis");
var redis = new Redis();

router.post("/domain", function (req, res) {
    let param = req.body;
    switch (param.queryType) {
        case 'PUT':
            redis.set(`c:dm:${param.py}`, param.lg);
                res.send("OK");
            break;
        
        case 'GET':
            redis.keys(`c:dm:*`, function (err, result) {
                res.send(result);
            });
            break;
        
        default:
            break;
    }
});